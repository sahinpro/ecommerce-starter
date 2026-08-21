import {
  IconAdjustmentsHorizontal,
  IconAlertCircle,
  IconAlertTriangle,
  IconArchive,
  IconArchiveOff,
  IconArrowRight,
  IconBell,
  IconBold,
  IconBox,
  IconBrightness,
  IconCalendar,
  IconCategory,
  IconCheck,
  IconChecks,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconChevronsDown,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircle,
  IconCircleCheck,
  IconCirclePlus,
  IconCircleX,
  IconClipboardText,
  IconClock,
  IconCommand,
  IconDeviceLaptop,
  IconDots,
  IconDotsVertical,
  IconEdit,
  IconExternalLink,
  IconEyeOff,
  IconFile,
  IconFileText,
  IconFileTypeDoc,
  IconFileTypePdf,
  IconFileTypeXls,
  IconFileZip,
  IconGripVertical,
  IconHeart,
  IconHelpCircle,
  IconInfoCircle,
  IconItalic,
  IconLayoutDashboard,
  IconLayoutSidebar,
  IconLoader2,
  IconLock,
  IconLogin,
  IconLogout,
  IconMenu2,
  IconMinus,
  IconMoon,
  IconPalette,
  IconPaperclip,
  IconPhone,
  IconPhoto,
  IconPlus,
  IconProps,
  IconRosetteDiscountCheck,
  IconSearch,
  IconSelector,
  IconSend,
  IconSettings,
  IconShare,
  IconSitemap,
  IconShoppingBag,
  IconSlash,
  IconSparkles,
  IconSun,
  IconTrash,
  IconTrendingDown,
  IconTrendingUp,
  IconTypography,
  IconUnderline,
  IconUpload,
  IconUser,
  IconUserCircle,
  IconUserEdit,
  IconUserX,
  IconUsers,
  IconVideo,
  IconX
} from '@tabler/icons-react';

export type Icon = React.ComponentType<IconProps>;

function GalleryCloseMark({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='28'
      height='28'
      viewBox='0 0 28 28'
      fill='none'
      className={className}
      {...props}
    >
      <line x1='0.646447' y1='14.0815' x2='14.0815' y2='0.646477' stroke='currentColor' />
      <line x1='14.081' y1='13.7886' x2='0.645988' y2='0.353583' stroke='currentColor' />
    </svg>
  );
}

function GalleryPlusMark({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      className={className}
      {...props}
    >
      <line x1='8' y1='2.5' x2='8' y2='13.5' stroke='currentColor' />
      <line x1='2.5' y1='8' x2='13.5' y2='8' stroke='currentColor' />
    </svg>
  );
}

export const Icons = {
  // General
  alertCircle: IconAlertCircle,
  warning: IconAlertTriangle,
  arrowRight: IconArrowRight,
  check: IconCheck,
  checks: IconChecks,
  circleCheck: IconCircleCheck,
  close: IconX,
  galleryClose: GalleryCloseMark,
  galleryPlus: GalleryPlusMark,
  clock: IconClock,
  dots: IconDots,
  ellipsis: IconDotsVertical,
  externalLink: IconExternalLink,
  help: IconHelpCircle,
  info: IconInfoCircle,
  spinner: IconLoader2,
  search: IconSearch,
  heart: IconHeart,
  shoppingBag: IconShoppingBag,
  navigation: IconSitemap,
  settings: IconSettings,
  trash: IconTrash,
  archive: IconArchive,
  restore: IconArchiveOff,

  // Navigation / Chevrons
  chevronDown: IconChevronDown,
  chevronLeft: IconChevronLeft,
  chevronRight: IconChevronRight,
  chevronUp: IconChevronUp,
  chevronsDown: IconChevronsDown,
  chevronsLeft: IconChevronsLeft,
  chevronsRight: IconChevronsRight,
  chevronsUpDown: IconSelector,

  // Layout
  dashboard: IconLayoutDashboard,
  category: IconCategory,
  panelLeft: IconLayoutSidebar,
  menu: IconMenu2,

  // User
  user: IconUser,
  user2: IconUserCircle,
  account: IconUserCircle,
  employee: IconUserX,
  userPen: IconUserEdit,
  teams: IconUsers,

  // Brand
  logo: IconCommand,

  // Communication
  notification: IconBell,
  phone: IconPhone,
  video: IconVideo,
  send: IconSend,
  paperclip: IconPaperclip,

  // Files
  page: IconFile,
  post: IconFileText,
  fileTypePdf: IconFileTypePdf,
  fileTypeDoc: IconFileTypeDoc,
  fileTypeXls: IconFileTypeXls,
  fileZip: IconFileZip,
  media: IconPhoto,

  // Actions
  add: IconPlus,
  edit: IconEdit,
  upload: IconUpload,
  share: IconShare,
  login: IconLogin,
  logout: IconLogout,
  gripVertical: IconGripVertical,

  // Shapes / Indicators
  circle: IconCircle,
  circleX: IconCircleX,
  plusCircle: IconCirclePlus,
  xCircle: IconCircleX,
  minus: IconMinus,

  // Theme
  sun: IconSun,
  moon: IconMoon,
  brightness: IconBrightness,
  laptop: IconDeviceLaptop,
  palette: IconPalette,

  // Commerce
  product: IconBox,
  sparkles: IconSparkles,
  badgeCheck: IconRosetteDiscountCheck,
  lock: IconLock,

  // Data
  trendingDown: IconTrendingDown,
  trendingUp: IconTrendingUp,
  eyeOff: IconEyeOff,
  adjustments: IconAdjustmentsHorizontal,

  // Text formatting
  bold: IconBold,
  italic: IconItalic,
  underline: IconUnderline,
  text: IconTypography,

  // Toast
  toastSuccess: IconCircleCheck,
  toastInfo: IconInfoCircle,
  toastWarning: IconAlertTriangle,
  toastError: IconCircleX,
  toastLoading: IconLoader2,

  // Misc
  forms: IconClipboardText,
  slash: IconSlash,
  calendar: IconCalendar,
  moreHorizontal: IconDots
};
