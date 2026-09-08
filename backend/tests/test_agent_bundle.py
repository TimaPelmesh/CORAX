from __future__ import annotations

import io
import re
import zipfile
from pathlib import Path

from app.agent_bundle import _build_windows_zip, _build_win10_zip
from app.schemas import AgentBundleCreate

_STOP_JOB_FORCE = re.compile(r"Stop-Job\s+.+\s-Force\b", re.IGNORECASE)


def test_windows_bundle_unifies_win7_and_win10():
    body = AgentBundleCreate(
        server_url="http://192.168.1.10:3000",
        create_token=False,
        existing_token="test-token-for-bundle",
        target="win10",
    )
    data, name = _build_windows_zip(body, body.server_url, "test-token-for-bundle")
    assert name.startswith("corax-agent-windows-")

    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        names = zf.namelist()
        assert "corax_send.bat" in names
        assert "agent_env.bat" in names
        assert "agent_config.json" in names
        assert "update_scripts.bat" in names
        assert "win10/corax_send.bat" in names
        assert "win10/lib/Agent-Common.ps1" in names
        assert "win7/inventory_send_win7.bat" in names
        env = zf.read("agent_env.bat").decode("utf-8")
        assert "192.168.1.10:3000" in env
        assert "__INVENTORY_SERVER__" not in env
        dispatcher = zf.read("corax_send.bat").decode("utf-8", errors="replace")
        assert "win10\\corax_send.bat" in dispatcher
        assert "Microsoft\\PowerShell\\3" in dispatcher
        assert "for /f %%P in ('powershell" not in dispatcher
        win10_bat = zf.read("win10/corax_send.bat").decode("utf-8", errors="replace")
        assert r"System32\WindowsPowerShell\v1.0\powershell.exe" in win10_bat
        assert "powershell.exe -NoProfile" not in win10_bat
        common = zf.read("win10/lib/Agent-Common.ps1").decode("utf-8-sig")
        assert "function Stop-AgentJob" in common
        for arc_name in names:
            if not arc_name.lower().endswith(".ps1"):
                continue
            text = zf.read(arc_name).decode("utf-8-sig")
            for line in text.splitlines():
                stripped = line.strip()
                if not stripped or stripped.startswith("#"):
                    continue
                assert not _STOP_JOB_FORCE.search(line), f"{arc_name}: {line}"
        config = zf.read("agent_config.json").decode("utf-8")
        assert "3.2.0-windows" in config
        client = zf.read("win10/InventoryClient.ps1").decode("utf-8-sig")
        assert "Start-ExtendedCollectJob" not in client
        assert "Invoke-ExtendedInProcess" in client
        core_post = client.find("$exitCode = Send-InventoryReport")
        ext_call = client.find("$extra = Invoke-ExtendedInProcess")
        assert core_post != -1 and ext_call != -1
        assert core_post < ext_call
        between = client[core_post:ext_call]
        assert "Install-CoraxHelpdeskShortcut" in between
        assert between.find("if ($exitCode -eq 0)") < between.find("Install-CoraxHelpdeskShortcut")
        post = zf.read("win10/lib/Invoke-Post.ps1").decode("utf-8-sig")
        assert "ConvertTo-AgentJson" in post
        assert "JavaScriptSerializer" in post
        run_cmd = (
            Path(__file__).resolve().parents[2]
            / "agent"
            / "cpp"
            / "portable"
            / "corax_run.cmd"
        ).read_text(encoding="utf-8", errors="replace")
        assert "Install-HelpdeskShortcut.ps1" not in run_cmd
        assert not any(ln.strip().lower().startswith("start ") for ln in run_cmd.splitlines())
        assert "pause" in run_cmd.lower()
        main_cpp = (
            Path(__file__).resolve().parents[2] / "agent" / "cpp" / "src" / "main.cpp"
        ).read_text(encoding="utf-8", errors="replace")
        assert "FreeConsole()" not in main_cpp
        fail_upload = main_cpp.find("ERROR: upload failed")
        shortcut_ok = main_cpp.find("ensure_helpdesk_shortcut")
        assert fail_upload != -1 and shortcut_ok != -1
        assert shortcut_ok > fail_upload


def test_win10_target_alias_builds_unified_zip():
    body = AgentBundleCreate(
        server_url="http://192.168.1.10:3000",
        create_token=False,
        existing_token="test-token-for-bundle",
    )
    data, name = _build_win10_zip(body, body.server_url, "test-token-for-bundle")
    assert name.startswith("corax-agent-windows-")
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        assert "win7/inventory_send_win7.bat" in zf.namelist()


def test_dockerfile_copies_windows_agent_wrapper():
    """Panel ZIP looks at /app/agent/windows — image must include the dispatcher tree."""
    from pathlib import Path

    dockerfile = Path(__file__).resolve().parents[2] / "Dockerfile"
    text = dockerfile.read_text(encoding="utf-8")
    assert "agent/windows" in text
    assert "COPY --chown=corax:corax agent/windows ./agent/windows" in text
