import { useState } from "react";
import { useWindowSize } from "@gpuix/react";
import {
  EventCalendar,
  type EventCalendarView,
  UIKitProvider,
  AppShell,
  Input,
  SegmentedControl,
  Button,
  Row,
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
  RatingBadge,
  VerificationCodeInput,
  GradientPicker,
  QRCode,
  ActivityGauge,
  LoadingIndicator,
  RadarChart,
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
  type ThemeMode,
  type GradientValue,
  type RichBlock,
  type VideoState,
} from "@mirai/gpuix-kit";
export const catalogPages = [
  "calendar",
  "identity",
  "gradient",
  "charts",
  "media",
  "editor",
  "sections",
  "marketing",
  "forms",
] as const;
export function CatalogGallery() {
  const { width, height } = useWindowSize(),
    [mode, setMode] = useState<ThemeMode>("dark"),
    [name, setName] = useState("UI catalog"),
    [page, setPage] = useState<string>("identity"),
    [event, setEvent] = useState("Ready"),
    [rating, setRating] = useState(3),
    [otp, setOtp] = useState(""),
    [radio, setRadio] = useState<string | null>("local"),
    [gradient, setGradient] = useState<GradientValue>({
      angle: 90,
      stops: [
        { id: "a", position: 0, color: "#2563EB" },
        { id: "b", position: 1, color: "#EC4899" },
      ],
    }),
    [hidden, setHidden] = useState<string[]>([]),
    [slide, setSlide] = useState<string | null>("a"),
    [doc, setDoc] = useState<RichBlock[]>([
      {
        id: "intro",
        kind: "paragraph",
        text: "Compose a reusable native document.",
      },
    ]),
    [video, setVideo] = useState<VideoState>({
      status: "paused",
      currentTime: 15,
      duration: 120,
      volume: 0.7,
      muted: false,
    }),
    [nav, setNav] = useState("home"),
    [step, setStep] = useState("two"),
    [faq, setFaq] = useState<string[]>([]),
    [contact, setContact] = useState({ name: "", email: "", message: "" }),
    [email, setEmail] = useState("");
  const [calendarDate, setCalendarDate] = useState("2026-09-14"),
    [calendarView, setCalendarView] = useState<EventCalendarView>("month");
  const column = {
      width: (width - 64) / 2,
      height: height - 190,
      overflowY: "scroll" as const,
      padding: 8,
    },
    item = [
      {
        id: "a",
        title: "Native components",
        description: "Reusable UI for your next app",
        meta: "NEW",
        price: "$12",
        features: ["Light and dark", "Controlled state"],
        actionLabel: "Explore",
      },
    ];
  return (
    <UIKitProvider mode={mode}>
      <AppShell>
        <Row style={{ height: 58, padding: 10 }}>
          <Text size={18} weight={600}>
            Catalog
          </Text>
          <Input
            testId="catalog-name"
            value={name}
            onValueChange={setName}
            style={{ width: 220 }}
          />
          <div style={{ flexGrow: 1 }} />
          <SegmentedControl
            testId="catalog-theme"
            value={mode}
            onValueChange={(v) => setMode(v as ThemeMode)}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
        </Row>
        <Row style={{ height: 42, paddingLeft: 12 }}>
          {catalogPages.map((p) => (
            <Button
              key={p}
              testId={"catalog-page-" + p}
              size="sm"
              variant={p === page ? "secondary" : "ghost"}
              onPress={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
        </Row>
        <Row
          gap={16}
          style={{
            padding: 16,
            height: height - 164,
            alignItems: "flex-start",
          }}
        >
          {page === "calendar" ? (
            <EventCalendar
              testId="catalog-calendar"
              date={calendarDate}
              onDateChange={setCalendarDate}
              view={calendarView}
              onViewChange={setCalendarView}
              width={width - 48}
              height={height - 180}
              events={[
                {
                  id: "review",
                  title: "Design review",
                  date: "2026-09-14",
                  startTime: "10:00",
                  endTime: "11:00",
                },
                {
                  id: "release",
                  title: "Release workshop",
                  date: "2026-09-15",
                  endDate: "2026-09-17",
                },
              ]}
              onEventPress={setEvent}
              onCreate={(date) => setEvent("Create on " + date)}
            />
          ) : null}
          {page === "identity" ? (
            <>
              <Stack style={column}>
                <AvatarGroup
                  testId="catalog-avatars"
                  items={Array.from({ length: 8 }, (_, i) => ({
                    id: String(i),
                    name: ["Alex", "Robin", "Sam"][i % 3]!,
                    status: "online" as const,
                  }))}
                  onOverflow={() => setEvent("Show all people")}
                />
                <BadgeGroup
                  testId="catalog-badges"
                  label="New"
                  onPress={() => setEvent("Release notes")}
                >
                  Release notes
                </BadgeGroup>
                <CreditCard
                  testId="catalog-credit"
                  holder="Alex Morgan"
                  last4="4242"
                  expiry="12/29"
                />
                <RadioCardGroup
                  testId="catalog-radio"
                  items={[
                    {
                      id: "local",
                      label: "Local",
                      description: "Keep this workspace on your device",
                    },
                    {
                      id: "shared",
                      label: "Shared",
                      description: "Connect your own sync service",
                    },
                    { id: "off", label: "Unavailable", disabled: true },
                  ]}
                  value={radio}
                  onValueChange={setRadio}
                />
              </Stack>
              <Stack style={column}>
                <RatingStars
                  testId="catalog-rating"
                  value={rating}
                  onValueChange={setRating}
                />
                <RatingBadge
                  testId="catalog-rating-badge"
                  value={rating}
                  count={128}
                />
                <VerificationCodeInput
                  testId="catalog-code"
                  value={otp}
                  onValueChange={setOtp}
                  onComplete={setEvent}
                />
                <Row>
                  <FeaturedIcon testId="catalog-icon">☆</FeaturedIcon>
                  <Illustration testId="catalog-illustration" kind="success" />
                </Row>
                <SocialButton
                  testId="catalog-social"
                  provider="Example"
                  onPress={() => setEvent("Sign-in intent")}
                />
                <AppStoreButton
                  testId="catalog-store"
                  store="apple"
                  onPress={() => setEvent("Store intent")}
                />
                <UtilityButton
                  testId="catalog-utility"
                  label="Copy link"
                  onPress={() => setEvent("Copy intent")}
                />
              </Stack>
            </>
          ) : null}
          {page === "gradient" ? (
            <>
              <Stack style={column}>
                <Text size={18}>Gradient editor</Text>
                <GradientPicker
                  testId="catalog-gradient"
                  value={gradient}
                  onValueChange={setGradient}
                />
              </Stack>
              <Stack style={column}>
                <QRCode
                  testId="catalog-qr"
                  value="https://gpuix.dev/"
                  label="Scan to open GPUIX"
                  size={220}
                />
                <Text>
                  QR codes keep a high-contrast quiet zone in both themes.
                </Text>
              </Stack>
            </>
          ) : null}
          {page === "charts" ? (
            <>
              <Stack style={column}>
                <ActivityGauge
                  testId="catalog-gauge"
                  value={72}
                  label="Weekly activity"
                />
                <LoadingIndicator testId="catalog-loading" />
                <LoadingIndicator
                  testId="catalog-loading-static"
                  reducedMotion
                  label="Reduced motion"
                />
              </Stack>
              <Stack style={column}>
                <RadarChart
                  testId="catalog-radar"
                  axes={[
                    { id: "a", label: "Quality", max: 100 },
                    { id: "b", label: "Speed", max: 100 },
                    { id: "c", label: "Coverage", max: 100 },
                  ]}
                  series={[
                    { id: "current", label: "Current", values: [80, 60, 90] },
                    { id: "target", label: "Target", values: [95, 85, 95] },
                  ]}
                  hiddenIds={hidden}
                  onHiddenChange={setHidden}
                />
              </Stack>
            </>
          ) : null}
          {page === "media" ? (
            <>
              <Stack style={column}>
                <Carousel
                  testId="catalog-carousel"
                  value={slide}
                  onValueChange={setSlide}
                  items={[
                    {
                      id: "a",
                      label: "Documents",
                      content: <Illustration kind="documents" size={140} />,
                    },
                    {
                      id: "b",
                      label: "Search",
                      content: <Illustration kind="search" size={140} />,
                    },
                  ]}
                  height={150}
                />
                <ImagePicker
                  testId="catalog-image"
                  value={null}
                  onChoose={() => setEvent("Image selection intent")}
                />
                <FileUploader
                  testId="catalog-upload"
                  files={[
                    {
                      id: "one",
                      name: "Design.pdf",
                      status: "uploading",
                      progress: 45,
                    },
                    {
                      id: "two",
                      name: "Notes.md",
                      status: "failed",
                      error: "Try again",
                    },
                  ]}
                  onChoose={() => setEvent("Choose files")}
                  onRetry={(id) => setEvent("Retry " + id)}
                  onRemove={(id) => setEvent("Remove " + id)}
                />
              </Stack>
              <Stack style={column}>
                <VideoPlayer
                  testId="catalog-video"
                  sourceId="demo"
                  state={video}
                  surface={
                    <Stack>
                      <Illustration kind="documents" />
                      <Text>Playback control demonstration</Text>
                    </Stack>
                  }
                  adapter={{
                    play: () => setVideo({ ...video, status: "playing" }),
                    pause: () => setVideo({ ...video, status: "paused" }),
                    seek: (currentTime) => setVideo({ ...video, currentTime }),
                    setMuted: (muted) => setVideo({ ...video, muted }),
                    setVolume: (volume) => setVideo({ ...video, volume }),
                  }}
                />
                <Text size={12}>
                  Local control state; no video decoder is connected in this
                  demo.
                </Text>
              </Stack>
            </>
          ) : null}
          {page === "editor" ? (
            <>
              <Stack style={{ width: width - 48 }}>
                <RichTextEditor
                  testId="catalog-editor"
                  value={doc}
                  onValueChange={setDoc}
                />
              </Stack>
            </>
          ) : null}
          {page === "sections" ? (
            <>
              <Stack style={column}>
                <HeaderNavigation
                  testId="catalog-header-nav"
                  brand={<Text>Mirai</Text>}
                  items={[
                    { id: "home", label: "Home" },
                    { id: "files", label: "Files" },
                  ]}
                  value={nav}
                  onValueChange={setNav}
                />
                <PageHeader
                  testId="catalog-page-header"
                  title={name}
                  description="Compose your application from native UI blocks"
                  actions={
                    <Button
                      testId="catalog-header-action"
                      onPress={() => setEvent("Create")}
                    >
                      Create
                    </Button>
                  }
                />
                <InlineCTA
                  testId="catalog-cta"
                  title="Ready to start?"
                  description="Connect your application commands"
                  actions={
                    <Button
                      testId="catalog-start"
                      onPress={() => setEvent("Start")}
                    >
                      Get started
                    </Button>
                  }
                />
                <SectionFooter
                  testId="catalog-section-footer"
                  actions={
                    <Button
                      testId="catalog-save"
                      onPress={() => setEvent("Save")}
                    >
                      Save
                    </Button>
                  }
                >
                  <Text>All changes saved locally</Text>
                </SectionFooter>
              </Stack>
              <Stack style={column}>
                <ProgressSteps
                  testId="catalog-steps"
                  steps={["one", "two", "three"].map((id, i) => ({
                    id,
                    label: ["Details", "Review", "Finish"][i]!,
                    status:
                      id === step
                        ? ("current" as const)
                        : i === 0
                          ? ("complete" as const)
                          : ("pending" as const),
                  }))}
                  onStepChange={setStep}
                />
              </Stack>
            </>
          ) : null}
          {page === "marketing" ? (
            <>
              <Stack style={column}>
                <Banner
                  testId="catalog-banner"
                  onDismiss={() => setEvent("Dismiss")}
                >
                  A new release is available
                </Banner>
                <HeroHeaderSection
                  testId="catalog-hero"
                  title="Build something useful"
                  description="Native components for desktop apps"
                />
                <PricingSection
                  testId="catalog-pricing"
                  title="Plans"
                  items={item}
                  onAction={setEvent}
                />
                <FAQSection
                  testId="catalog-faq"
                  title="Questions"
                  items={[
                    {
                      id: "one",
                      question: "Does the kit include backend services?",
                      answer:
                        "Applications provide their own data and services.",
                    },
                  ]}
                  expandedIds={faq}
                  onExpandedChange={setFaq}
                />
                <FooterSection
                  testId="catalog-footer"
                  brand="Mirai"
                  links={[{ id: "docs", label: "Documentation" }]}
                  onNavigate={setEvent}
                />
              </Stack>
              <Stack style={column}>
                <BlogSection
                  testId="catalog-blog"
                  title="Updates"
                  items={item}
                  onAction={setEvent}
                />
                <TeamSection
                  testId="catalog-team"
                  title="Team"
                  items={[{ id: "sam", title: "Sam", description: "Designer" }]}
                />
                <FeaturesSection
                  testId="catalog-features"
                  title="Features"
                  items={item}
                />
                <TestimonialSection
                  testId="catalog-testimonials"
                  title="Stories"
                  items={item}
                />
              </Stack>
            </>
          ) : null}
          {page === "forms" ? (
            <>
              <Stack style={column}>
                <ContactSection
                  testId="catalog-contact"
                  value={contact}
                  onValueChange={setContact}
                  onSubmit={() => setEvent("Contact submit intent")}
                />
              </Stack>
              <Stack style={column}>
                <NewsletterCTA
                  testId="catalog-newsletter"
                  value={email}
                  onValueChange={setEmail}
                  onSubscribe={() => setEvent("Subscribe intent")}
                />
              </Stack>
            </>
          ) : null}
        </Row>
        <Text
          testId="catalog-event"
          size={12}
          style={{ height: 40, padding: 10 }}
        >
          {event}
        </Text>
      </AppShell>
    </UIKitProvider>
  );
}
