"""Identify the employee PC / LDAP account for the public /h form."""

from __future__ import annotations

import base64
import ipaddress
import socket
from typing import Iterable

from fastapi import Request

_SSO_HEADERS = (
    "remote-user",
    "x-remote-user",
    "x-forwarded-user",
    "x-authenticated-user",
)

_DOCKERISH_NETS = (
    ipaddress.ip_network("172.17.0.0/16"),
    ipaddress.ip_network("172.18.0.0/16"),
    ipaddress.ip_network("192.168.65.0/24"),
)


def normalize_ip(raw: str | None) -> str | None:
    s = (raw or "").strip()
    if not s:
        return None
    if s.startswith("[") and "]" in s:
        s = s[1 : s.index("]")]
    if "%" in s:
        s = s.split("%", 1)[0]
    try:
        addr = ipaddress.ip_address(s)
    except ValueError:
        return None
    if isinstance(addr, ipaddress.IPv6Address) and addr.ipv4_mapped:
        addr = addr.ipv4_mapped
    return str(addr)


def is_dockerish_ip(ip: str | None) -> bool:
    parsed = normalize_ip(ip)
    if not parsed:
        return True
    addr = ipaddress.ip_address(parsed)
    if addr.is_loopback or addr.is_link_local or addr.is_unspecified:
        return True
    return any(addr in net for net in _DOCKERISH_NETS)


def sam_account(raw: str | None) -> str | None:
    s = (raw or "").strip().strip('"').strip("'")
    if not s:
        return None
    lower = s.lower()
    for prefix in ("negotiate ", "ntlm ", "basic "):
        if lower.startswith(prefix):
            return None
    if "\\" in s:
        s = s.rsplit("\\", 1)[-1]
    if "/" in s:
        s = s.rsplit("/", 1)[-1]
    if "@" in s:
        s = s.split("@", 1)[0]
    s = s.strip()
    return s or None


def ntlm_type3_username(authorization: str | None) -> str | None:
    """Best-effort username from an NTLM Type 3 blob (no password check)."""
    raw_header = (authorization or "").strip()
    if not raw_header:
        return None
    parts = raw_header.split(None, 1)
    if len(parts) != 2:
        return None
    scheme, token = parts[0].lower(), parts[1].strip()
    if scheme not in {"ntlm", "negotiate"}:
        return None
    try:
        blob = base64.b64decode(token)
    except (ValueError, TypeError):
        return None
    if len(blob) < 64 or blob[:7] != b"NTLMSSP":
        return None
    msg_type = int.from_bytes(blob[8:12], "little")
    if msg_type != 3:
        return None
    ulen = int.from_bytes(blob[36:38], "little")
    uoff = int.from_bytes(blob[40:44], "little")
    if ulen == 0 or ulen > 512 or uoff + ulen > len(blob):
        return None
    name_bytes = blob[uoff : uoff + ulen]
    try:
        name = name_bytes.decode("utf-16-le").strip("\x00").strip()
    except UnicodeDecodeError:
        name = name_bytes.decode("utf-8", errors="ignore").strip()
    return sam_account(name)


def client_ip_from_parts(peer: str | None, forwarded_for: str | None, real_ip: str | None) -> str:
    candidates: list[str] = []
    for item in (forwarded_for or "").split(","):
        got = normalize_ip(item)
        if got:
            candidates.append(got)
    real = normalize_ip(real_ip)
    if real:
        candidates.append(real)
    peer_ip = normalize_ip(peer)
    if peer_ip:
        candidates.append(peer_ip)
    for ip in candidates:
        addr = ipaddress.ip_address(ip)
        if addr.is_private and not addr.is_loopback and not addr.is_link_local:
            return ip
    return candidates[0] if candidates else ""


def client_ip(request: Request) -> str:
    peer = (request.client.host if request.client else "") or ""
    return client_ip_from_parts(
        peer,
        request.headers.get("x-forwarded-for"),
        request.headers.get("x-real-ip"),
    )


def sso_login_from_headers(headers: Iterable[tuple[str, str]]) -> str | None:
    mapping = {str(k).lower(): v for k, v in headers}
    for key in _SSO_HEADERS:
        got = sam_account(mapping.get(key))
        if got:
            return got
    return ntlm_type3_username(mapping.get("authorization"))


def sso_login(request: Request) -> str | None:
    return sso_login_from_headers(request.headers.items())


def reverse_dns_shortname(ip: str, timeout_sec: float = 0.35) -> str | None:
    parsed = normalize_ip(ip)
    if not parsed or is_dockerish_ip(parsed):
        return None
    prev = socket.getdefaulttimeout()
    socket.setdefaulttimeout(timeout_sec)
    try:
        host, _, _ = socket.gethostbyaddr(parsed)
    except OSError:
        return None
    finally:
        socket.setdefaulttimeout(prev)
    name = (host or "").strip().rstrip(".")
    if not name:
        return None
    return name


def is_private_ip(ip: str | None) -> bool:
    parsed = normalize_ip(ip)
    if not parsed:
        return False
    try:
        return ipaddress.ip_address(parsed).is_private
    except ValueError:
        return False
