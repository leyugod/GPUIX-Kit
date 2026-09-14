import { CatalogGallery } from "./catalog";
import { TablePreferencesGallery } from "./table-preferences";
import { FiltersGallery } from "./filters";
import { CollectionsGallery } from "./collections";
import { SidebarsGallery } from "./sidebars";
import { ModalsGallery } from "./modals";
import { TokensGallery } from "./tokens";
import { NotificationsGallery } from "./notifications";
import { ColorsGallery } from "./colors";
import { ActionsGallery } from "./actions";
import { DatesGallery } from "./dates";
import { TimeGallery } from "./time";
import { ChoicesGallery } from "./choices";
import { ControlsGallery } from "./controls";
import { StudioGallery } from "./studio";
import { render } from "@gpuix/react";
import { WorkbenchGallery } from "./workbench";
import { Gallery } from "./gallery";
import { DesktopGallery } from "./desktop";
// 展示应用只维护内存状态，不加载 CRM 服务或任何真实外部连接。
render(
  process.argv.includes("--catalog") ? (
    <CatalogGallery />
  ) : process.argv.includes("--table-prefs") ? (
    <TablePreferencesGallery />
  ) : process.argv.includes("--filters") ? (
    <FiltersGallery />
  ) : process.argv.includes("--collections") ? (
    <CollectionsGallery />
  ) : process.argv.includes("--sidebars") ? (
    <SidebarsGallery />
  ) : process.argv.includes("--modals") ? (
    <ModalsGallery />
  ) : process.argv.includes("--tokens") ? (
    <TokensGallery />
  ) : process.argv.includes("--notifications") ? (
    <NotificationsGallery />
  ) : process.argv.includes("--colors") ? (
    <ColorsGallery />
  ) : process.argv.includes("--actions") ? (
    <ActionsGallery />
  ) : process.argv.includes("--dates") ? (
    <DatesGallery />
  ) : process.argv.includes("--tracks") ? (
    <ControlsGallery initialPage="tracks" />
  ) : process.argv.includes("--time") ? (
    <TimeGallery />
  ) : process.argv.includes("--choices") ? (
    <ChoicesGallery />
  ) : process.argv.includes("--controls") ? (
    <ControlsGallery />
  ) : process.argv.includes("--studio") ? (
    <StudioGallery />
  ) : process.argv.includes("--workbench") ? (
    <WorkbenchGallery />
  ) : process.argv.includes("--desktop") ? (
    <DesktopGallery />
  ) : (
    <Gallery />
  ),
  {
    title: "Mirai UIKit — GPUIX",
    appName: "Mirai UIKit",
    width: 1320,
    height: 920,
    minWidth: 1000,
    minHeight: 720,
  },
);
