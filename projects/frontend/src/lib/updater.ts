// Check if we're running in Tauri environment
const isTauri = typeof window !== 'undefined' && window.__TAURI__;

export async function checkForAppUpdates() {
  // Only run update checks in Tauri environment
  if (!isTauri) {
    console.log("Update check skipped - not running in Tauri environment");
    return;
  }

  console.log("Checking for updates");
  try {
    // Dynamically import Tauri modules only when needed
    const { check } = await import("@tauri-apps/plugin-updater");
    const { ask } = await import("@tauri-apps/plugin-dialog");
    const { relaunch } = await import("@tauri-apps/plugin-process");

    const update = await check();

    if (update?.available) {
      console.log("update available");
      const yes = await ask(
        `Update to ${update.version} is available!\nRelease notes: ${update.body}`,
        {
          title: "Update Now!",
          kind: "info",
          okLabel: "Update",
          cancelLabel: "Cancel",
        }
      );

      if (yes) {
        console.log("trying to update");
        await update.downloadAndInstall();
        console.log("updated");
        await relaunch();
      }
    }
  } catch (error) {
    console.error("Update check failed:", error);
  }
}
