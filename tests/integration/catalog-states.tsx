import assert from "node:assert/strict";
import { useState, type ReactNode } from "react";
import { createTestRoot } from "@gpuix/react/testing";
import { connectTest } from "@gpuix/react/automation";
import {
  EventCalendar,
  Button,
  AvatarLabelGroup,
  RadioButton,
  UIKitProvider,
  AppShell,
  Stack,
  Text,
  AvatarGroup,
  BadgeGroup,
  FeaturedIcon,
  Illustration,
  CreditCard,
  SocialButton,
  AppStoreButton,
  UtilityButton,
  RadioCardGroup,
  RatingStars,
  VerificationCodeInput,
  GradientPicker,
  QRCode,
  RadarChart,
  ActivityGauge,
  LoadingIndicator,
  Carousel,
  ImagePicker,
  ImageViewer,
  VideoPlayer,
  FileUploader,
  RichTextEditor,
  PageHeader,
  SectionFooter,
  HeaderNavigation,
  InlineCTA,
  ProgressSteps,
  Banner,
  BlogSection,
  CareersSection,
  FeaturesSection,
  MetricsSection,
  PricingSection,
  SocialProofSection,
  TeamSection,
  TestimonialSection,
  HeroHeaderSection,
  HeaderSection,
  CTASection,
  RichContentSection,
  FooterSection,
  MarketingHeaderNavigation,
  FAQSection,
  ContactSection,
  NewsletterCTA,
  type GradientValue,
  type RichBlock,
  type VideoState,
} from "@mirai/gpuix-kit";
const root = createTestRoot({ width: 1000, height: 900 }),
  app = await connectTest(root.renderer);
let generation = 0,
  events: string[] = [];
const settle = async () => {
  for (let i = 0; i < 3; i++) {
    await new Promise<void>((r) => setImmediate(r));
    root.renderer.flush();
    root.renderer.dispatchNativeEvents();
  }
};
const view = async (node: ReactNode) => {
  root.render(
    <UIKitProvider key={++generation} mode="light">
      <AppShell>
        <Stack style={{ width: 800, padding: 12 }}>{node}</Stack>
      </AppShell>
    </UIKitProvider>,
  );
  await settle();
};
const click = async (id: string) => {
  await app.getByTestId(id).click();
  await settle();
};
const fill = async (id: string, value: string) => {
  await app.getByTestId(id).fill(value);
  await settle();
};
const press = async (id: string, key: string) => {
  await app.getByTestId(id).press(key);
  await settle();
};
const get = (id: string) => root.renderer.findByTestId(id);
function Inputs() {
  const [rating, setRating] = useState(2),
    [code, setCode] = useState(""),
    [radio, setRadio] = useState<string | null>("a");
  return (
    <>
      <RatingStars
        testId="rating"
        value={rating}
        onValueChange={(v) => {
          setRating(v);
          events.push("rating:" + v);
        }}
      />
      <VerificationCodeInput
        testId="code"
        value={code}
        onValueChange={setCode}
        onComplete={(v) => events.push(v)}
      />
      <RadioCardGroup
        testId="radio"
        items={[
          { id: "a", label: "A" },
          { id: "off", label: "Off", disabled: true },
          { id: "b", label: "B" },
        ]}
        value={radio}
        onValueChange={(v) => {
          setRadio(v);
          events.push(v);
        }}
      />
    </>
  );
}
function Gradient() {
  const [value, setValue] = useState<GradientValue>({
    angle: 90,
    stops: [
      { id: "a", position: 0, color: "#000000" },
      { id: "b", position: 1, color: "#FFFFFF" },
    ],
  });
  return (
    <>
      <GradientPicker
        testId="gradient"
        value={value}
        onValueChange={setValue}
      />
      <Text testId="gradient-value">{JSON.stringify(value)}</Text>
    </>
  );
}
function Rich() {
  const [value, setValue] = useState<RichBlock[]>([
    { id: "a", kind: "paragraph", text: "Original" },
  ]);
  return (
    <>
      <RichTextEditor testId="rich" value={value} onValueChange={setValue} />
      <Text testId="rich-value">{JSON.stringify(value)}</Text>
    </>
  );
}
function Slides() {
  const [value, setValue] = useState<string | null>("a");
  return (
    <Carousel
      testId="slides"
      value={value}
      onValueChange={setValue}
      items={[
        { id: "a", label: "A", content: <Text>Alpha</Text> },
        { id: "b", label: "B", content: <Text>Beta</Text> },
      ]}
    />
  );
}
function Questions() {
  const [ids, setIds] = useState<string[]>([]);
  return (
    <FAQSection
      testId="faq"
      title="FAQ"
      items={[{ id: "a", question: "Question?", answer: "Answer" }]}
      expandedIds={ids}
      onExpandedChange={setIds}
    />
  );
}
try {
  await view(<Inputs />);
  await click("rating-4");
  assert(events.includes("rating:4"));
  await press("rating-4", "right");
  assert(events.includes("rating:5"));
  await fill("code-input", "01-23a45");
  assert(events.includes("012345"));
  assert.equal(await app.getByTestId("code-digit-0").textContent(), "0");
  await click("radio-off");
  assert(!events.includes("off"));
  await click("radio-b");
  assert(events.includes("b"));
  await view(
    <VerificationCodeInput
      testId="bad-code"
      value=""
      onValueChange={() => {}}
      length={20}
    />,
  );
  assert(get("bad-code-error"));
  await view(
    <RatingStars
      testId="readonly-rating"
      value={2}
      readOnly
      onValueChange={() => events.push("blocked")}
    />,
  );
  await click("readonly-rating-5");
  assert(!events.includes("blocked"));
  await view(<Gradient />);
  await fill("gradient-color", "#FF0000");
  await press("gradient-color", "enter");
  assert(
    (await app.getByTestId("gradient-value").textContent()).includes("#FF0000"),
  );
  await click("gradient-add");
  assert(get("gradient-stop-stop-1"));
  await click("gradient-remove");
  assert(!get("gradient-stop-stop-1"));
  await click("gradient-angle-increment");
  assert(
    (await app.getByTestId("gradient-value").textContent()).includes(
      '"angle":91',
    ),
  );
  await view(<QRCode testId="qr" value="Native QR" />);
  assert(get("qr-code"));
  await view(<QRCode testId="qr" value="" />);
  assert(get("qr-error"));
  await view(
    <RadarChart
      testId="radar"
      axes={[
        { id: "a", label: "A", max: 1 },
        { id: "b", label: "B", max: 1 },
        { id: "c", label: "C", max: 1 },
      ]}
      series={[{ id: "s", label: "Series", values: [0.5, 0.8, 0.2] }]}
      onHiddenChange={(ids) => events.push(ids.join(","))}
    />,
  );
  await click("radar-series-s");
  assert(events.includes("s"));
  await view(<RadarChart testId="bad-radar" axes={[]} series={[]} />);
  assert(get("bad-radar-error"));
  await view(
    <>
      <ActivityGauge testId="gauge" value={50} label="Goal" />
      <LoadingIndicator testId="loading" reducedMotion />
    </>,
  );
  assert(get("gauge-arc"));
  assert.equal(get("loading-dot-0")!.style.opacity, 1);
  await view(<Slides />);
  await click("slides-next");
  assert(JSON.stringify(root.renderer.getPaintedText()).includes("Beta"));
  await click("slides-next");
  assert(
    (await app.getByTestId("slides-position").textContent()).startsWith(
      "2 / 2",
    ),
  );
  await click("slides-previous");
  assert(JSON.stringify(root.renderer.getPaintedText()).includes("Alpha"));
  await view(
    <ImagePicker
      testId="image"
      value={null}
      onChoose={async () => {
        throw Error("private failure");
      }}
    />,
  );
  await click("image-choose");
  assert(get("image-error"));
  assert(
    !JSON.stringify(root.renderer.getPaintedText()).includes("private failure"),
  );
  await view(<ImagePicker testId="unsupported-image" value={null} />);
  assert(
    JSON.stringify(root.renderer.getPaintedText()).includes("unavailable"),
  );
  await view(<ImageViewer testId="viewer" image={null} />);
  await click("viewer-zoom-in");
  assert(JSON.stringify(root.renderer.getPaintedText()).includes("No image"));
  const state: VideoState = {
    status: "paused",
    currentTime: 10,
    duration: 100,
    volume: 0.5,
    muted: false,
  };
  await view(<VideoPlayer testId="video" sourceId="one" state={state} />);
  assert(get("video-unsupported"));
  let finish: () => void = () => {};
  let plays = 0;
  await view(
    <VideoPlayer
      testId="video"
      sourceId="one"
      state={state}
      adapter={{
        play: () => {
          plays++;
          return new Promise<void>((r) => {
            finish = r;
          });
        },
        setMuted: (v) => {
          events.push("mute:" + v);
        },
      }}
    />,
  );
  await click("video-play");
  await click("video-play");
  assert.equal(plays, 1);
  finish();
  await settle();
  await click("video-mute");
  assert(events.includes("mute:true"));
  await view(
    <VideoPlayer
      testId="video"
      sourceId="other"
      state={state}
      adapter={{
        play: async () => {
          throw Error("secret");
        },
      }}
    />,
  );
  await click("video-play");
  assert(get("video-error"));
  assert(!JSON.stringify(root.renderer.getPaintedText()).includes("secret"));
  await view(
    <FileUploader
      testId="files"
      files={Array.from({ length: 7 }, (_, i) => ({
        id: String(i),
        name: "File " + i,
        status: "failed" as const,
      }))}
      onChoose={() => {
        events.push("choose");
      }}
      onRetry={(id) => {
        events.push("retry:" + id);
      }}
    />,
  );
  await click("files-files-retry-0");
  assert(events.includes("retry:0"));
  await click("files-next");
  assert(get("files-files-5"));
  assert(!get("files-files-0"));
  await click("files-choose");
  assert(events.includes("choose"));
  await view(<Rich />);
  await click("rich-bold");
  assert(
    (await app.getByTestId("rich-value").textContent()).includes('"bold":true'),
  );
  await click("rich-undo");
  assert(
    !(await app.getByTestId("rich-value").textContent()).includes(
      '"bold":true',
    ),
  );
  await click("rich-redo");
  assert(
    (await app.getByTestId("rich-value").textContent()).includes('"bold":true'),
  );
  await fill("rich-link-input", "javascript:x");
  await click("rich-link");
  assert(
    !(await app.getByTestId("rich-value").textContent()).includes("javascript"),
  );
  await fill("rich-link-input", "https://example.com");
  await click("rich-link");
  assert(
    (await app.getByTestId("rich-value").textContent()).includes(
      "https://example.com",
    ),
  );
  await click("rich-add");
  assert(
    (await app.getByTestId("rich-value").textContent()).includes("block-1"),
  );
  await fill("rich-input", "Second");
  await click("rich-remove");
  assert(
    !(await app.getByTestId("rich-value").textContent()).includes("Second"),
  );
  await view(
    <RichTextEditor
      testId="readonly"
      readOnly
      value={[{ id: "a", kind: "paragraph", text: "Safe" }]}
      onValueChange={() => events.push("unexpected")}
    />,
  );
  await click("readonly-bold");
  assert(!events.includes("unexpected"));
  await view(<Questions />);
  await click("faq-a");
  assert(get("faq-answer-a"));
  await click("faq-a");
  assert(!get("faq-answer-a"));
  await view(
    <NewsletterCTA
      testId="news"
      value="person@example.com"
      onValueChange={() => {}}
      onSubscribe={async () => {
        throw Error("secret");
      }}
    />,
  );
  await click("news-subscribe");
  assert(get("news-error"));
  await view(
    <ContactSection
      testId="contact"
      value={{ name: "A", email: "invalid", message: "Hi" }}
      onValueChange={() => {}}
      onSubmit={() => {
        events.push("invalid-submit");
      }}
    />,
  );
  await click("contact-submit");
  assert(!events.includes("invalid-submit"));
  await view(
    <ContactSection
      testId="contact"
      value={{ name: "A", email: "a@example.com", message: "Hi" }}
      onValueChange={() => {}}
      onSubmit={(v) => {
        events.push(v.email);
      }}
    />,
  );
  await click("contact-submit");
  assert(events.includes("a@example.com"));
  await view(
    <AvatarGroup
      testId="avatars"
      max={2}
      items={[
        { id: "a", name: "A" },
        { id: "b", name: "B" },
        { id: "c", name: "C" },
      ]}
      onOverflow={() => events.push("people")}
    />,
  );
  await click("avatars-overflow");
  assert(events.includes("people"));
  await view(
    <>
      <BadgeGroup
        testId="badge"
        label="New"
        onPress={() => events.push("badge")}
      >
        Details
      </BadgeGroup>
      <SocialButton
        testId="social"
        provider="Provider"
        onPress={() => events.push("social")}
      />
      <AppStoreButton
        testId="store"
        store="google"
        onPress={() => events.push("store")}
      />
      <UtilityButton
        testId="utility"
        label="Copy"
        onPress={() => events.push("copy")}
      />
      <FeaturedIcon testId="icon" />
      <Illustration testId="illustration" />
      <CreditCard testId="credit" holder="Sample" last4="invalid" />
    </>,
  );
  for (const id of ["badge-action", "social", "store", "utility"])
    await click(id);
  assert(
    events.includes("badge") &&
      events.includes("social") &&
      events.includes("store") &&
      events.includes("copy"),
  );
  assert(!JSON.stringify(root.renderer.getPaintedText()).includes("invalid"));
  await view(
    <HeaderNavigation
      testId="nav"
      items={[
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ]}
      value="a"
      onValueChange={(id) => events.push("nav:" + id)}
    />,
  );
  await click("nav-b");
  assert(events.includes("nav:b"));
  await view(
    <ProgressSteps
      testId="steps"
      steps={[
        { id: "a", label: "A", status: "complete" },
        { id: "b", label: "B", status: "current" },
        { id: "off", label: "Off", status: "pending", disabled: true },
      ]}
      onStepChange={(id) => events.push("step:" + id)}
    />,
  );
  await click("steps-a");
  await click("steps-off");
  assert(events.includes("step:a") && !events.includes("step:off"));
  for (const Component of [
    BlogSection,
    CareersSection,
    FeaturesSection,
    MetricsSection,
    PricingSection,
    SocialProofSection,
    TeamSection,
    TestimonialSection,
  ]) {
    await view(
      <Component
        testId="section"
        title="Section"
        items={[
          { id: "one", title: "One", description: "Body", actionLabel: "Open" },
        ]}
        onAction={(id) => events.push("section:" + id)}
      />,
    );
    await click("section-action-one");
    assert(JSON.stringify(root.renderer.getPaintedText()).includes("Body"));
  }
  for (const Component of [HeroHeaderSection, HeaderSection, CTASection]) {
    await view(
      <Component
        testId="hero"
        title="Title"
        description="Description"
        actions={<Text>Actions</Text>}
      />,
    );
    assert(
      JSON.stringify(root.renderer.getPaintedText()).includes("Description"),
    );
  }
  await view(
    <>
      <PageHeader testId="page" title="Page" description="Description" />
      <InlineCTA testId="cta" title="Call to action" />
      <SectionFooter testId="footer">
        <Text>Footer</Text>
      </SectionFooter>
      <RichContentSection testId="content" title="Content">
        <Text>Rich body</Text>
      </RichContentSection>
    </>,
  );
  assert(JSON.stringify(root.renderer.getPaintedText()).includes("Rich body"));
  await view(
    <Banner testId="banner" onDismiss={() => events.push("dismiss")}>
      Banner
    </Banner>,
  );
  await click("banner-dismiss");
  assert(events.includes("dismiss"));
  await view(
    <FooterSection
      testId="footer"
      brand="Brand"
      links={[{ id: "docs", label: "Docs" }]}
      onNavigate={(id) => events.push(id)}
    />,
  );
  await click("footer-docs");
  assert(events.includes("docs"));
  await view(
    <MarketingHeaderNavigation
      testId="marketing-nav"
      value="one"
      items={[{ id: "one", label: "One" }]}
      onValueChange={(id) => events.push(id)}
    />,
  );
  await click("marketing-nav-one");
  assert(events.includes("one"));

  await view(
    <RadioButton
      testId="standalone-radio"
      label="Select"
      checked={false}
      onCheckedChange={(v) => events.push("radio:" + v)}
    />,
  );
  await click("standalone-radio-selected");
  assert(events.includes("radio:true"));
  await view(
    <AvatarLabelGroup
      testId="avatar-label"
      name="Person"
      description="Designer"
    />,
  );
  assert(JSON.stringify(root.renderer.getPaintedText()).includes("Designer"));
  const calendarEvents = [
    {
      id: "one",
      title: "Review",
      date: "2026-09-14",
      startTime: "10:00",
      endTime: "11:00",
    },
    {
      id: "span",
      title: "Workshop",
      date: "2026-09-15",
      endDate: "2026-09-17",
    },
  ];
  await view(
    <EventCalendar
      testId="calendar"
      date="2026-09-14"
      view="month"
      events={calendarEvents}
      onDateChange={(v) => events.push(v)}
      onViewChange={(v) => events.push("calendar:" + v)}
      onEventPress={(v) => events.push("event:" + v)}
    />,
  );
  await click("calendar-next");
  assert(events.includes("2026-10-14"));
  await click("calendar-event-2026-09-14-one");
  assert(events.includes("event:one"));
  await click("calendar-view-day");
  assert(events.includes("calendar:day"));
  await view(
    <EventCalendar
      testId="calendar"
      date="2026-09-16"
      view="day"
      events={calendarEvents}
      onDateChange={() => {}}
      onViewChange={() => {}}
      onEventPress={(v) => events.push("day:" + v)}
      onCreate={(v) => events.push("create:" + v)}
    />,
  );
  await click("calendar-event-2026-09-16-span");
  assert(events.includes("day:span"));
  await click("calendar-create");
  assert(events.includes("create:2026-09-16"));
  await view(
    <EventCalendar
      testId="calendar"
      date="bad"
      view="month"
      events={[]}
      onDateChange={() => {}}
      onViewChange={() => {}}
    />,
  );
  assert(get("calendar-error"));
  function CalendarPagination() {
    const [items, setItems] = useState(
      Array.from({ length: 11 }, (_, i) => ({
        id: String(i).padStart(2, "0"),
        title: "Event " + i,
        date: "2026-09-14",
      })),
    );
    return (
      <>
        <Button
          testId="shrink-calendar"
          onPress={() => setItems(items.slice(0, 1))}
        >
          Shrink
        </Button>
        <EventCalendar
          testId="paged-calendar"
          events={items}
          date="2026-09-14"
          view="day"
          onDateChange={() => {}}
          onViewChange={() => {}}
          onEventPress={() => {}}
        />
      </>
    );
  }
  await view(<CalendarPagination />);
  await click("paged-calendar-page-next");
  assert(get("paged-calendar-event-2026-09-14-10"));
  await click("shrink-calendar");
  assert(
    get("paged-calendar-event-2026-09-14-00"),
    "External deletion clamps the current day page",
  );
  await view(
    <FeaturedIcon testId="featured-surface">
      <Text testId="featured-custom">Custom</Text>
    </FeaturedIcon>,
  );
  assert(
    get("featured-custom"),
    "Custom icon nodes must not be flattened to text",
  );
  console.log(
    "PASS catalog states: input, geometry models, media ports, request locks/errors, rich edits/history, all section families and action boundaries",
  );
} finally {
  root.render(null);
  await app.close();
}
