import { check } from "@tauri-apps/plugin-updater";
import { ask } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";

export async function checkForAppUpdates() {
  console.log("Checking for updates");
  try {
    const update = await check();

    if (update?.available) {
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
        await update.downloadAndInstall();
        await relaunch();
      }
    }
  } catch (error) {
    console.error("Update check failed:", error);
  }
}
