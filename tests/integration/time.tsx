import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import { TimeGallery } from "@mirai/gallery/time";
const narrow = process.argv.includes("--narrow");
const root = createTestRoot({
  width: narrow ? 1000 : 1320,
  height: narrow ? 720 : 920,
});
root.render(<TimeGallery />);
const app = await connectTest(root.renderer);
const settle = async () => {
  await new Promise<void>((r) => setImmediate(r));
  root.renderer.flush();
  root.renderer.dispatchNativeEvents();
};
const get = (id: string) => root.renderer.findByTestId(id);
const text = (id: string) => app.getByTestId(id).textContent();
const press = async (id: string, key: string) => {
  await app.getByTestId(id).press(key);
  await settle();
};
const key = async (key: string) => {
  root.renderer.simulateKeystrokes(key);
  await settle();
};
const click = async (id: string) => {
  await app.getByTestId(id).click();
  await settle();
};
const fill = async (value: string) => {
  await app.getByTestId("meeting").fill(value);
  await settle();
};
const shot = (name: string) =>
  app.screenshot({
    path: resolve(`artifacts/time-${name}${narrow ? "-narrow" : ""}.png`),
  });
try {
  await settle();
  await shot("dark");
  let mountedMinutes = 0;
  for (let minute = 0; minute < 1440; minute++) {
    const time = `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
    if (get(`minutes-option-${time}`)) mountedMinutes++;
  }
  assert.equal(mountedMinutes, 8, "Full-day list mounts only the visible page");
  await fill("11:45");
  await press("meeting", "enter");
  assert.equal(await text("meeting-commit"), "11:45");
  await press("meeting", "up");
  assert.equal(await text("meeting-value"), "13:00");
  await click("meeting-decrement");
  assert.equal(await text("meeting-value"), "11:45");
  await fill("12:00");
  await press("meeting", "enter");
  assert(get("meeting-error"));
  assert.equal(await text("meeting-commit"), "11:45");
  await fill("invalid");
  await press("meeting", "enter");
  assert.equal(await text("meeting-value"), "invalid");
  assert.equal(await text("meeting-commit"), "11:45");
  await click("meeting-increment");
  assert.equal(await text("meeting-value"), "09:00");
  assert(!get("meeting-error"));
  await fill("17:00");
  await press("meeting-increment", "enter");
  assert.equal(await text("meeting-value"), "17:00");
  await press("readonly-time", "up");
  assert(root.renderer.getPaintedText().includes("10:00"));
  await press("disabled-time-trigger", "enter");
  assert(!get("disabled-time-popup"));
  await press("minutes-list", "end");
  assert(get("minutes-option-23:59"));
  assert(!get("minutes-option-09:00"));
  assert.equal(await text("minutes-page"), "180 / 180");
  assert.equal(await text("minutes-value"), "09:00");
  await key("enter");
  assert.equal(await text("minutes-value"), "23:59");
  await press("minutes-list", "home");
  await key("pagedown");
  assert.equal(await text("minutes-page"), "2 / 180");
  await key("enter");
  assert.equal(await text("minutes-value"), "00:08");
  await click("minutes-next");
  await key("enter");
  assert.equal(await text("minutes-value"), "00:16");
  await press("appointment-trigger", "enter");
  assert(get("appointment-popup"));
  await key("down");
  await key("enter");
  assert(!get("appointment-popup"));
  assert.equal(await text("appointment-value"), "10:45");
  await key("enter");
  assert(get("appointment-popup"), "Selection restores trigger focus");
  await shot("picker-dark");
  await key("end");
  await key("enter");
  assert.equal(await text("appointment-value"), "17:00");
  await key("enter");
  await key("escape");
  assert(!get("appointment-popup"));
  await key("enter");
  assert(get("appointment-popup"));
  await key("home");
  await key("enter");
  assert.equal(await text("appointment-value"), "09:00");
  await click("appointment-clear");
  assert.equal(await text("appointment-value"), "No selection");
  await app.getByTestId("time-name").fill("时间选择草稿");
  await click("time-theme-light");
  assert(root.renderer.getPaintedText().includes("时间选择草稿"));
  await shot("light");
  await press("appointment-trigger", "enter");
  await shot("picker-light");
  await click("appointment-times-option-09:15");
  assert.equal(await text("appointment-value"), "09:15");
  console.log(
    `PASS time field draft/commit/step/bounds, full-day paging, picker keyboard/pointer/focus and themes (${narrow ? "1000x720" : "1320x920"})`,
  );
} finally {
  root.render(null);
  await app.close();
}
