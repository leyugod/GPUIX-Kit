import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
const run = (args: string[], cwd = process.cwd()) => {
  const result = Bun.spawnSync(args, { cwd, stdout: "pipe", stderr: "pipe" });
  assert.equal(
    result.exitCode,
    0,
    `${args.join(" ")}\n${result.stdout}\n${result.stderr}`,
  );
  return String(result.stdout);
};
run([process.execPath, "run", "pack"]);
const manifest = JSON.parse(
  readFileSync("packages/uikit/package.json", "utf8"),
);
const catalog = JSON.parse(
  readFileSync("docs/untitled-ui-coverage.json", "utf8"),
);
const catalogExports = [
  ...new Set(catalog.rows.flatMap((row: { exports: string[] }) => row.exports)),
];
const archive = resolve(`artifacts/mirai-gpuix-kit-${manifest.version}.tgz`);
const entries = run(["tar", "-tzf", archive]);
for (const path of [
  "package/src/index.ts",
  "package/LICENSE",
  "package/licenses/Darwin-UI.txt",
  "package/README.md",
  "package/docs/desktop.md",
  "package/docs/workbench.md",
  "package/docs/studio.md",
  "package/docs/controls.md",
  "package/docs/choices.md",
  "package/docs/time.md",
  "package/docs/slider-tracks.md",
  "package/docs/date-navigation.md",
  "package/docs/actions.md",
  "package/docs/colors.md",
  "package/docs/notifications.md",
  "package/docs/token-input.md",
  "package/docs/modals.md",
  "package/docs/sidebars.md",
  "package/docs/collections.md",
  "package/docs/filters.md",
  "package/docs/table-preferences.md",
  "package/docs/host-adapter.md",
  "package/docs/catalog-completion.md",
  "package/licenses/qrcode-generator.txt",
  "package/src/components/navigation/index.tsx",
])
  assert(entries.includes(path));
assert(
  !entries.includes(".test.ts"),
  "Published source must exclude repository tests",
);
const directory = mkdtempSync(join(tmpdir(), "gpuix-kit-consumer-"));
try {
  writeFileSync(
    join(directory, "package.json"),
    JSON.stringify({
      name: "independent-kit-consumer",
      private: true,
      type: "module",
      dependencies: {
        "@mirai/gpuix-kit": archive,
        "@gpuix/react": "0.7.0",
        react: "19.2.4",
      },
      devDependencies: {
        typescript: "5.9.3",
        "@types/react": "19.2.14",
        "@types/bun": "1.3.5",
        "@types/node": "22.20.2",
        "undici-types": "6.21.0",
      },
    }),
  );
  writeFileSync(
    join(directory, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "Bundler",
        jsx: "react-jsx",
        jsxImportSource: "@gpuix/react",
        strict: true,
        skipLibCheck: true,
        noEmit: true,
        types: ["react", "bun"],
      },
      include: ["consumer.tsx"],
    }),
  );
  writeFileSync(
    join(directory, "consumer.tsx"),
    `import {createTestRoot} from '@gpuix/react/testing';
import {UIKitProvider, AppShell, Button, Text} from '@mirai/gpuix-kit';
import * as CatalogKit from '@mirai/gpuix-kit';
import {QRCode} from '@mirai/gpuix-kit/qr-code';
import {qrMatrix} from '@mirai/gpuix-kit/qr-model';
import {VerificationCodeInput,RatingStars} from '@mirai/gpuix-kit/rating';
import {RichTextEditor} from '@mirai/gpuix-kit/rich-editor';
import {eventCalendarDays} from '@mirai/gpuix-kit/event-calendar';
for (const name of ${JSON.stringify(catalogExports)}) if(typeof (CatalogKit as Record<string,unknown>)[name] !== 'function') throw new Error('Missing packaged catalog export '+name);
if(qrMatrix('Packaged QR').length<21 || eventCalendarDays('2026-09-14','month').length!==42) throw new Error('Packaged catalog models failed');

import {createTheme} from '@mirai/gpuix-kit/tokens';
import {SidebarNavigation, Breadcrumb} from '@mirai/gpuix-kit/navigation';
import {SplitView, Inspector} from '@mirai/gpuix-kit/split-view';
import {Popover} from '@mirai/gpuix-kit/popover';
import {DropdownMenu, ContextMenu} from '@mirai/gpuix-kit/menu';
import {CommandPalette} from '@mirai/gpuix-kit/command';
import {ComboBox, MultiSelect} from '@mirai/gpuix-kit/combobox';
import {NumberField, DateField, isISODate} from '@mirai/gpuix-kit/value-input';
import {createCommandRegistry} from '@mirai/gpuix-kit/interaction';
if (![SidebarNavigation,Breadcrumb,SplitView,Inspector,Popover,DropdownMenu,ContextMenu,CommandPalette,ComboBox,MultiSelect,NumberField,DateField].every(c=>typeof c==='function') || !isISODate('2024-02-29') || !createCommandRegistry([]).search('').every(Boolean)) throw new Error('Desktop export missing');
import {ResourceState,LoadMoreButton} from '@mirai/gpuix-kit/resource-state';
import {AsyncListView} from '@mirai/gpuix-kit/async-list';
import {CollectionView,CollectionItem} from '@mirai/gpuix-kit/collection';
import {collectionLayout,collectionError} from '@mirai/gpuix-kit/collection-model';
import {LazyTreeView} from '@mirai/gpuix-kit/lazy-tree';
import {treeLoadState,lazyTreeError} from '@mirai/gpuix-kit/lazy-tree-model';
if(![ResourceState,LoadMoreButton,AsyncListView,CollectionView,CollectionItem,LazyTreeView].every(c=>typeof c==='function') || collectionLayout(600).columns!==3 || collectionError([{id:'a'}]) || treeLoadState({id:'a',label:'A',children:[]})!=='ready' || lazyTreeError([])) throw new Error('Collections exports failed');
import {FilterChip,FilterSummary,FilterConditionRow,FilterBuilder,FilterPanel,SavedViewPicker,type FilterField,type FilterExpression} from '@mirai/gpuix-kit/filters';
import {cloneFilter,filterExpressionError,viewNameError} from '@mirai/gpuix-kit/filter-model';
if(![FilterChip,FilterSummary,FilterConditionRow,FilterBuilder,FilterPanel,SavedViewPicker].every(c=>typeof c==='function') || filterExpressionError([],{match:'all',conditions:[]}) || !viewNameError('',[])) throw new Error('Filter exports failed');
import {ColumnVisibilityMenu,ColumnOrderList,SortRuleList,DensityControl,TablePreferencesPanel,ConfigurableDataGrid,type TablePreferences} from '@mirai/gpuix-kit/table-preferences';
import {defaultTablePreferences,sortByRules,tablePreferencesError} from '@mirai/gpuix-kit/table-preferences-model';
import {createHostAdapter,type HostPorts} from '@mirai/gpuix-kit/host-adapter';
if(![ColumnVisibilityMenu,ColumnOrderList,SortRuleList,DensityControl,TablePreferencesPanel,ConfigurableDataGrid].every(c=>typeof c==='function')) throw new Error('Table preferences exports failed');
const portValues = new Map<string,string>();
const consumerPorts:HostPorts={writePreference:(key,value)=>{portValues.set(key,value);},readPreference:key=>portValues.get(key)??null};
const consumerHost=createHostAdapter(consumerPorts);
if(!(await consumerHost.writePreference('view','compact')).ok || (await consumerHost.readPreference('view')).ok!==true || portValues.get('view')!=='compact') throw new Error('Packaged injected host failed');
const noClipboard=await consumerHost.readClipboardText();
if(noClipboard.ok || noClipboard.reason!=='unsupported') throw new Error('Packaged missing host falsely succeeded');
import {useFocusTarget} from '@mirai/gpuix-kit/focus';
import {ListView} from '@mirai/gpuix-kit/list-view';
import {TreeView} from '@mirai/gpuix-kit/tree-view';
import {DataGrid} from '@mirai/gpuix-kit/data-grid';
import {FilterBar} from '@mirai/gpuix-kit/filter-bar';
import {DocumentTabs} from '@mirai/gpuix-kit/document-tabs';
import {useForm,required} from '@mirai/gpuix-kit/form';
import {CodeBlock,DiffView,FileList,FilePickerArea} from '@mirai/gpuix-kit/content';
import {selectItems} from '@mirai/gpuix-kit/selection';
if (![ListView,TreeView,DataGrid,FilterBar,DocumentTabs,useForm,CodeBlock,DiffView,FileList,FilePickerArea].every(c=>typeof c==='function') || !required()('') || selectItems([{id:'a'}],[],'a',null,'single')[0]!=='a') throw new Error('Workbench exports failed');

import {CartesianChart,LineChart,AreaChart,BarChart,PieChart,DonutChart} from '@mirai/gpuix-kit/charts';
import {validateChart} from '@mirai/gpuix-kit/chart-model';
import {MetricCard} from '@mirai/gpuix-kit/metrics';
import {Timeline,ActivityFeed} from '@mirai/gpuix-kit/timeline';
import {MessageBubble,MessageList,MessageComposer,canSendMessage} from '@mirai/gpuix-kit/messages';
import {DashboardLayout,ConversationLayout,SettingsLayout} from '@mirai/gpuix-kit/patterns';
import {createWindowAdapter} from '@mirai/gpuix-kit/platform';
if (![CartesianChart,LineChart,AreaChart,BarChart,PieChart,DonutChart,MetricCard,Timeline,ActivityFeed,MessageBubble,MessageList,MessageComposer,DashboardLayout,ConversationLayout,SettingsLayout].every(c=>typeof c==='function') || validateChart([],[]) !== null || !canSendMessage('hello',[]) || createWindowAdapter(null).getSize().ok) throw new Error('Studio exports failed');
import {Slider,RangeSlider} from '@mirai/gpuix-kit/slider';
import {snapSlider,sliderStops,sliderHitRegions} from '@mirai/gpuix-kit/slider-model';
import {Calendar,RangeCalendar,DatePicker,DateRangePicker} from '@mirai/gpuix-kit/calendar';
import {addDays} from '@mirai/gpuix-kit/calendar-model';
if (![Slider,RangeSlider,Calendar,RangeCalendar,DatePicker,DateRangePicker].every(c=>typeof c==='function') || snapSlider(3,{min:0,max:10,step:2})!==4 || addDays('2024-02-28',1)!=='2024-02-29') throw new Error('Controls exports failed');
import {Checkbox,CheckboxGroup} from '@mirai/gpuix-kit/checkbox';
import {checkboxState} from '@mirai/gpuix-kit/checkbox-model';
import {Tag,TokenField} from '@mirai/gpuix-kit/tags';
import {prepareTokens} from '@mirai/gpuix-kit/token-model';
if (![Checkbox,CheckboxGroup,Tag,TokenField].every(c=>typeof c==='function') || checkboxState([{value:'a',label:'A'},{value:'b',label:'B'}],['a'])!=='indeterminate' || !prepareTokens([],'A,B').ok) throw new Error('Choices exports failed');
import {TimeField,TimeList,TimePicker} from '@mirai/gpuix-kit/time-input';
import {timeOptions,isSelectableTime} from '@mirai/gpuix-kit/time-model';
if (![TimeField,TimeList,TimePicker].every(c=>typeof c==='function') || timeOptions().length!==1440 || !isSelectableTime('09:07',{min:'09:07',stepMinutes:15})) throw new Error('Time exports failed');
let committedTime='';
import {MonthPicker,YearPicker} from '@mirai/gpuix-kit/period-picker';
import {validYear,yearPage} from '@mirai/gpuix-kit/period-model';
import {DualCalendar,DualRangeCalendar,DateRangePresets,DateRangePanel,DateRangeDialog,createDateRangePresets} from '@mirai/gpuix-kit/date-range';
import {dualMonthStart,completeRangeError} from '@mirai/gpuix-kit/date-range-model';
if (![MonthPicker,YearPicker,DualCalendar,DualRangeCalendar,DateRangePresets,DateRangePanel,DateRangeDialog].every(c=>typeof c==='function') || !validYear(9999) || yearPage(9999)!==9997 || dualMonthStart('9999-12')!=='9999-11' || createDateRangePresets('2024-03-15').length!==6 || completeRangeError({start:'2024-02-01',end:'2024-02-03'})) throw new Error('Date navigation exports failed');
import {ButtonGroup,SplitButton,ToolbarActions,PathControl,WorkspaceSwitcher,AccountMenu} from '@mirai/gpuix-kit/actions';
import {partitionActions,partitionPath} from '@mirai/gpuix-kit/action-model';
if (![ButtonGroup,SplitButton,ToolbarActions,PathControl,WorkspaceSwitcher,AccountMenu].every(c=>typeof c==='function') || partitionActions([],2).overflow.length!==0 || partitionPath([],2).hidden.length!==0) throw new Error('Actions exports failed');
import {ColorSwatch,ColorWell,ColorField,ColorPalette,ColorPanel,ColorPicker} from '@mirai/gpuix-kit/color';
import {normalizeHexColor,compositeColor} from '@mirai/gpuix-kit/color-model';
if(![ColorSwatch,ColorWell,ColorField,ColorPalette,ColorPanel,ColorPicker].every(c=>typeof c==='function') || normalizeHexColor('#abc8')!=='#AABBCC88' || compositeColor({r:255,g:0,b:0,a:128},'#fff')!=='#FF7F7F') throw new Error('Color exports failed');
import {NoticeCard,UndoToast,ToastViewport,useNotificationQueue,createNotificationQueue} from '@mirai/gpuix-kit/notifications';
import {notificationError,nextNotificationDelay} from '@mirai/gpuix-kit/notification-model';
import {ProgressRing,TaskProgress,TaskList,TaskSummary,type ProgressTask} from '@mirai/gpuix-kit/task-progress';
import {taskActions,progressFraction} from '@mirai/gpuix-kit/task-model';
if(![NoticeCard,UndoToast,ToastViewport,useNotificationQueue,createNotificationQueue,ProgressRing,TaskProgress,TaskList,TaskSummary].every(c=>typeof c==='function') || notificationError({id:'a',title:'A'})!==null || nextNotificationDelay([],3)!==null || progressFraction(50)!==0.5) throw new Error('Notification/task exports failed');
import {TokenSuggestionList,TokenCombobox,EditableTag,TokenEditor,TokenPickerPanel,TokenPicker,type EditableToken} from '@mirai/gpuix-kit/token-input';
import {renameToken,createSuggestedToken,filterTokenSuggestions} from '@mirai/gpuix-kit/token-input-model';
if(![TokenSuggestionList,TokenCombobox,EditableTag,TokenEditor,TokenPickerPanel,TokenPicker].every(c=>typeof c==='function') || !renameToken([{id:'a',label:'A'}],'a','B').ok || !createSuggestedToken([],'Fresh',[]).ok || filterTokenSuggestions([{id:'x',label:'X'}],'x').length!==1) throw new Error('Token input exports failed');
import {AlertDialog,ConfirmDialog,PromptDialog,Sheet,Drawer,ProgressDialog} from '@mirai/gpuix-kit/modal';
import {modalDimensions,validatePrompt} from '@mirai/gpuix-kit/modal-model';
import {createOverlayStack} from '@mirai/gpuix-kit/overlay-model';
if(![AlertDialog,ConfirmDialog,PromptDialog,Sheet,Drawer,ProgressDialog].every(c=>typeof c==='function') || modalDimensions(1000,720,'drawer').height!==720 || validatePrompt('')!==null) throw new Error('Modal exports failed');
const packagedLayers=createOverlayStack();
const packagedLayer=packagedLayers.allocate('modal');
packagedLayers.mount(packagedLayer);
if(!packagedLayers.isTop(packagedLayer.id)) throw new Error('Overlay model failed');
packagedLayers.unmount(packagedLayer.id);
import {SourceListSidebar,SourceListRow,SourceListSectionHeader} from '@mirai/gpuix-kit/source-list';
import {sourceEntries,sourceListError} from '@mirai/gpuix-kit/source-list-model';
import {SidebarToggle,NavigationPane,NavigationSplitView} from '@mirai/gpuix-kit/navigation-split';
import {navigationLayout} from '@mirai/gpuix-kit/navigation-split-model';
if(![SourceListSidebar,SourceListRow,SourceListSectionHeader,SidebarToggle,NavigationPane,NavigationSplitView].every(c=>typeof c==='function') || sourceListError([])!==null || sourceEntries([],[]).length!==0 || navigationLayout({width:500,contentVisible:true}).content!==false) throw new Error('Sidebar exports failed');
let checked=false;
let sliderValue=0;
const root = createTestRoot({width:480,height:320});
root.render(<UIKitProvider mode="light"><AppShell><Text>Independent consumer</Text><Button testId="consumer-button" onPress={()=>{}}>Reusable</Button><Slider testId="consumer-slider" value={20} onValueChange={v=>{sliderValue=v;}}/><Checkbox testId="consumer-checkbox" checked="indeterminate" label="Partial" onCheckedChange={v=>{checked=v;}}/><TimeField testId="consumer-time" value="09:00" onValueChange={()=>{}} onValueCommit={v=>{committedTime=v;}}/></AppShell></UIKitProvider>);
await new Promise<void>(done=>setImmediate(done));root.renderer.flush();
if (!root.renderer.getPaintedText().includes('Independent consumer')) throw new Error('Package failed to render');
if (createTheme('light').mode !== 'light' || typeof useFocusTarget !== 'function') throw new Error('Public subpath missing');
const thumb=root.renderer.findByTestId("consumer-slider-thumb-0");
if(!thumb) throw new Error("Packaged slider missing");
root.renderer.nativeSimulateKeystrokes(thumb.id,"end");
if(sliderValue!==100) throw new Error("Packaged slider interaction failed");
const checkbox=root.renderer.findByTestId("consumer-checkbox");
if(!checkbox) throw new Error("Packaged checkbox missing");
root.renderer.nativeSimulateKeystrokes(checkbox.id,"space");
if(!checked) throw new Error("Packaged tri-state interaction failed");
const timeField=root.renderer.findByTestId("consumer-time");
if(!timeField) throw new Error("Packaged time field missing");
root.renderer.nativeSimulateKeystrokes(timeField.id,"enter");
if(committedTime!=="09:00") throw new Error("Packaged time commit failed");
if(sliderStops({min:0,max:10,step:3})?.length!==5 || sliderHitRegions({min:0,max:100,step:25},280).length!==5) throw new Error("Track models missing");
let trackValue=0;
root.render(<UIKitProvider><AppShell><Slider testId="packaged-track" value={0} onValueChange={v=>{trackValue=v;}} step={25} trackPress marks={[{value:0,label:"Min"},{value:100,label:"Max"}]} /></AppShell></UIKitProvider>);
await new Promise<void>(done=>setImmediate(done));root.renderer.flush();
const region=root.renderer.findByTestId("packaged-track-stop-3");
if(!region || !root.renderer.findByTestId("packaged-track-mark-label-100")) throw new Error("Packaged track or marks missing");
const {connectTest}=await import('@gpuix/react/automation');
const app=await connectTest(root.renderer);
await app.getByTestId("packaged-track-stop-3").click();
if(trackValue!==75) throw new Error("Packaged track click failed");
let selectedMonth='';
root.render(<UIKitProvider><AppShell><MonthPicker testId="packaged-month" year={2024} onYearChange={()=>{}} value="2024-02" onValueChange={value=>{selectedMonth=value;}} /></AppShell></UIKitProvider>);
await new Promise<void>(done=>setImmediate(done));root.renderer.flush();
await app.getByTestId("packaged-month-item-2024-03").click();
if(selectedMonth!=="2024-03") throw new Error("Packaged month selection failed");
let packagedAction='';
root.render(<UIKitProvider><AppShell><SplitButton testId="packaged-split" primary={{id:'save',label:'Save',run:()=>{packagedAction='save';}}} items={[]} open={false} onOpenChange={()=>{}}/></AppShell></UIKitProvider>);
await new Promise<void>(done=>setImmediate(done));root.renderer.flush();
await app.getByTestId("packaged-split-primary").click();
if(packagedAction!=='save') throw new Error('Packaged primary action failed');
let packagedWorkspace='';
root.render(<UIKitProvider><AppShell><WorkspaceSwitcher testId="packaged-workspace" items={Array.from({length:9},(_,i)=>({id:String(i),label:'Workspace '+i}))} value="8" onValueChange={id=>{packagedWorkspace=id;}} open={true} onOpenChange={()=>{}}/></AppShell></UIKitProvider>);
await new Promise<void>(done=>setImmediate(done));root.renderer.flush();
if(!root.renderer.findByTestId("packaged-workspace-item-8") || root.renderer.findByTestId("packaged-workspace-item-0")) throw new Error('Packaged menu pagination failed');
root.renderer.simulateKeystrokes("up");
await new Promise<void>(done=>setImmediate(done));root.renderer.flush();
root.renderer.simulateKeystrokes("enter");
if(packagedWorkspace!=='7') throw new Error('Packaged workspace keyboard selection failed');
let packagedColor='';
root.render(<UIKitProvider><AppShell><ColorPalette testId="packaged-palette" value={null} onValueChange={v=>{packagedColor=v;}}/></AppShell></UIKitProvider>);
await new Promise<void>(done=>setImmediate(done));root.renderer.flush();
await app.getByTestId("packaged-palette-item-red").click();
if(packagedColor!=='#EF4444') throw new Error('Packaged palette pointer selection failed');
let packagedHex='';
root.render(<UIKitProvider><AppShell><ColorField testId="packaged-color" value="#abc8" onValueChange={()=>{}} onValueCommit={v=>{packagedHex=v;}}/></AppShell></UIKitProvider>);
await new Promise<void>(done=>setImmediate(done));root.renderer.flush();
await app.getByTestId("packaged-color").press("enter");
if(packagedHex!=='#AABBCC88') throw new Error('Packaged color field commit failed');
const packagedQueue=createNotificationQueue();
packagedQueue.enqueue({id:'one',title:'Packaged notice',durationMs:null});
root.render(<UIKitProvider><AppShell><ToastViewport testId="packaged-notices" queue={packagedQueue}/></AppShell></UIKitProvider>);
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-notices-one-dismiss").click();
if(packagedQueue.getSnapshot().entries.length) throw new Error('Packaged notification dismiss failed');
let packagedTaskAction='';
const packagedTask:ProgressTask={id:'job',title:'Packaged task',status:'running',completed:50,total:100,pausable:true};
if(taskActions(packagedTask)[0]!=='pause') throw new Error('Packaged task model failed');
root.render(<UIKitProvider><AppShell><TaskProgress testId="packaged-task" task={packagedTask} onAction={(id,action)=>{packagedTaskAction=id+':'+action;}}/></AppShell></UIKitProvider>);
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-task-pause").click();
if(packagedTaskAction!=='job:pause') throw new Error('Packaged task intent failed');
let packagedSuggestion='';
root.render(<UIKitProvider><AppShell><TokenSuggestionList testId="packaged-suggestions" options={[{id:'catalog-a',label:'Alpha'}]} onSelect={t=>{packagedSuggestion=t.id;}}/></AppShell></UIKitProvider>);
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-suggestions-item-catalog-a").click();
if(packagedSuggestion!=='catalog-a') throw new Error('Packaged suggestion identity failed');
let packagedRename='';
const packagedToken:EditableToken={id:'stable',label:'Old'};
root.render(<UIKitProvider><AppShell><EditableTag testId="packaged-edit" token={packagedToken} onTokenChange={token=>{packagedRename=token.id+':'+token.label;}}/></AppShell></UIKitProvider>);
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-edit-edit").click();
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-edit-input").fill("New");
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-edit-input").press("enter");
if(packagedRename!=='stable:New') throw new Error('Packaged token rename lost identity');
let packagedConfirmed=false, packagedClosed=false;
root.render(<UIKitProvider><AppShell children={null} overlay={<ConfirmDialog open testId="packaged-confirm" title="Confirm package" onOpenChange={open=>{packagedClosed=!open;}} onConfirm={()=>{packagedConfirmed=true;}}/>}/></UIKitProvider>);
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-confirm-confirm").click();
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
if(!packagedConfirmed || !packagedClosed) throw new Error('Packaged confirmation failed');
let packagedPrompt='';
root.render(<UIKitProvider><AppShell children={null} overlay={<PromptDialog open testId="packaged-prompt" title="Rename" value="Old" onOpenChange={()=>{}} onSubmit={value=>{packagedPrompt=value;}}/>}/></UIKitProvider>);
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-prompt-input").fill("New");
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-prompt-input").press("enter");
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
if(packagedPrompt!=='New') throw new Error('Packaged prompt commit failed');
root.render(<UIKitProvider><AppShell children={null} overlay={<Sheet open testId="packaged-sheet" title="Sheet" onOpenChange={()=>{}}><Text>Panel body</Text></Sheet>}/></UIKitProvider>);
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
const packagedSheet=await app.getByTestId("packaged-sheet").bounds();
if(packagedSheet.y>1 || packagedSheet.x<0 || packagedSheet.x+packagedSheet.width>480 || packagedSheet.height>320) throw new Error('Packaged sheet geometry failed');
let packagedSource='';
root.render(<UIKitProvider><AppShell><SourceListSidebar testId="packaged-source" height={200} groups={[{id:'favorites',label:'Favorites',items:[{id:'a',label:'A'},{id:'off',label:'Off',disabled:true},{id:'b',label:'B'}]}]} value="a" onValueChange={id=>{packagedSource=id;}} collapsed={[]} onCollapsedChange={()=>{}}/></AppShell></UIKitProvider>);
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-source-item-b").click();
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
if(packagedSource!=='b') throw new Error('Packaged source pointer selection failed');
root.renderer.simulateKeystrokes("up");
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
if(String(packagedSource)!=='a') throw new Error('Packaged source keyboard skip failed');
let packagedSidebarWidth=0;
root.render(<UIKitProvider><AppShell><NavigationSplitView testId="packaged-navigation" width={480} height={280} detailMinWidth={160} sidebar={<Text>Sources</Text>} onSidebarWidthChange={value=>{packagedSidebarWidth=value;}}><NavigationPane testId="packaged-detail" title="Details"><Text>Reusable two-column layout</Text></NavigationPane></NavigationSplitView></AppShell></UIKitProvider>);
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
if(!root.renderer.findByTestId("packaged-navigation-pane-sidebar") || root.renderer.findByTestId("packaged-navigation-pane-content")) throw new Error('Packaged two-column shape failed');
await app.getByTestId("packaged-navigation-sidebar-divider").press("right");
if(packagedSidebarWidth!==234) throw new Error('Packaged sidebar resizing failed');
const packagedDetail=await app.getByTestId("packaged-detail").bounds();
if(packagedDetail.x<0 || packagedDetail.x+packagedDetail.width>481 || packagedDetail.height>280) throw new Error('Packaged detail bounds failed');
let packagedSelection='';
root.render(<UIKitProvider><AppShell><CollectionView testId="packaged-grid" width={480} height={240} items={[{id:'a'},{id:'off',disabled:true},{id:'b'}]} selectedIds={['a']} onSelectionChange={ids=>{packagedSelection=ids.join(',');}} renderItem={item=><CollectionItem title={item.id}/>}/></AppShell></UIKitProvider>);
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-grid").press("right");
if(packagedSelection!=='b') throw new Error('Packaged collection keyboard failed');
let packagedLoad='';
root.render(<UIKitProvider><AppShell><LazyTreeView testId="packaged-tree" nodes={[{id:'remote',label:'Remote',hasChildren:true}]} expandedIds={[]} onExpandedChange={()=>{}} selectedIds={[]} onSelectionChange={()=>{}} onRequestChildren={id=>{packagedLoad=id;}}/></AppShell></UIKitProvider>);
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-tree").press("right");
if(packagedLoad!=='remote') throw new Error('Packaged lazy tree load intent failed');
let packagedRetried=false;
root.render(<UIKitProvider><AppShell><ResourceState testId="packaged-resource" state="error" onRetry={()=>{packagedRetried=true;}}/></AppShell></UIKitProvider>);
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-resource-retry").click();
if(!packagedRetried) throw new Error('Packaged resource retry failed');
const packagedFields:FilterField[]=[{id:'title',label:'Title',kind:'text'}];
let packagedFilter:FilterExpression|undefined;
root.render(<UIKitProvider><AppShell><FilterPanel testId="packaged-filters" fields={packagedFields} value={{match:'all',conditions:[]}} onApply={value=>{packagedFilter=value;}} onCancel={()=>{}}/></AppShell></UIKitProvider>);
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-filters-builder-add").click();
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-filters-builder-condition-1-value").fill("Packaged");
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-filters-apply").click();
if(!packagedFilter || packagedFilter.conditions[0]?.value!=='Packaged') throw new Error('Packaged filter draft failed');
let packagedViewName='',packagedViewValue='';
root.render(<UIKitProvider><AppShell><SavedViewPicker testId="packaged-views" fields={packagedFields} views={[]} value={null} filter={cloneFilter(packagedFilter)} onValueChange={()=>{}} onCreate={(name,snapshot)=>{packagedViewName=name;packagedViewValue=snapshot.conditions[0]?.value??'';}}/></AppShell></UIKitProvider>);
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-views-name").fill("Saved filter");
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-views-create").click();
if(packagedViewName!=='Saved filter' || packagedViewValue!=='Packaged') throw new Error('Packaged saved view intent failed');
const preferenceColumns=[{id:'name',label:'Name',header:'Name',sortable:true,value:(row:{id:string;name:string})=>row.name}];
const preferenceDefault=defaultTablePreferences(preferenceColumns);
if(tablePreferencesError(preferenceColumns,preferenceDefault) || sortByRules([{n:2},{n:1}],[{columnId:'n',direction:'asc'}],r=>r.n)[0]?.n!==1) throw new Error('Packaged table models failed');
let packagedPreference:TablePreferences|undefined;
root.render(<UIKitProvider><AppShell><TablePreferencesPanel testId="packaged-prefs" columns={preferenceColumns} value={preferenceDefault} onApply={value=>{packagedPreference=value;}} onCancel={()=>{}}/></AppShell></UIKitProvider>);
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-prefs-tab-display").click();
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-prefs-density-compact").click();
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-prefs-apply").click();
if(packagedPreference?.density!=='compact' || preferenceDefault.density!=='regular') throw new Error('Packaged preferences draft failed');
root.render(<UIKitProvider><AppShell><ConfigurableDataGrid testId="packaged-preference-grid" columns={preferenceColumns} rows={[{id:'one',name:'One'}]} rowKey={r=>r.id} preferences={packagedPreference} onPreferencesChange={()=>{}} selectedIds={[]} onSelectionChange={()=>{}} height={160}/></AppShell></UIKitProvider>);
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
if(root.renderer.findByTestId("packaged-preference-grid-rows-one")?.style.height!==34) throw new Error('Packaged density geometry failed');
root.render(<UIKitProvider><AppShell><QRCode testId="packaged-qr" value="Packaged QR" size={120}/></AppShell></UIKitProvider>);
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
if(!root.renderer.findByTestId("packaged-qr")) throw new Error('Packaged QR render failed');
let packagedCode='';
root.render(<UIKitProvider><AppShell><VerificationCodeInput testId="packaged-code" value="" onValueChange={()=>{}} onComplete={code=>{packagedCode=code;}}/></AppShell></UIKitProvider>);
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-code-input").fill("001234");
if(packagedCode!=='001234') throw new Error('Packaged verification code failed');
let packagedRating=0;
root.render(<UIKitProvider><AppShell><RatingStars testId="packaged-rating" value={0} onValueChange={n=>{packagedRating=n;}}/></AppShell></UIKitProvider>);
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-rating-4").click();
if(packagedRating!==4) throw new Error('Packaged rating failed');
let packagedBold=false;
root.render(<UIKitProvider><AppShell><RichTextEditor testId="packaged-editor" value={[{id:'a',kind:'paragraph',text:'Native'}]} onValueChange={doc=>{packagedBold=!!doc[0]?.bold;}}/></AppShell></UIKitProvider>);
for(let i=0;i<3;i++){await new Promise<void>(done=>setImmediate(done));root.renderer.flush();}
await app.getByTestId("packaged-editor-bold").click();
if(!packagedBold) throw new Error('Packaged rich document intent failed');
root.render(null);
packagedQueue.dispose();
await app.close();
`,
  );
  run(
    [process.execPath, "install", "--offline", "--ignore-scripts"],
    directory,
  );
  run([join(directory, "node_modules/.bin/tsc"), "--noEmit"], directory);
  run([process.execPath, "consumer.tsx"], directory);
  console.log(
    "PASS: tgz contains public source, docs and licenses; independent Bun install, TypeScript consumer and native render",
  );
} finally {
  rmSync(directory, { recursive: true, force: true });
}
