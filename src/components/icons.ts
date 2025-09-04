import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Mail as MailIcon,
  CalendarToday as CalendarTodayIcon,
  ShoppingCart as ShoppingCartIcon,
  ShoppingBag as ShoppingBagIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Folder as FolderIcon,
  FileCopy as FileCopyIcon,
  Bookmark as BookmarkIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  List as ListIcon,
} from '@mui/icons-material';

export const ICON_MAP: Record<string, React.ElementType> = {
  Home: HomeIcon,
  Dashboard: DashboardIcon,
  Settings: SettingsIcon,
  People: PeopleIcon,
  Notifications: NotificationsIcon,
  AccountCircle: AccountCircleIcon,
  Mail: MailIcon,
  CalendarToday: CalendarTodayIcon,
  ShoppingCart: ShoppingCartIcon,
  ShoppingBag: ShoppingBagIcon,
  Search: SearchIcon,
  Edit: EditIcon,
  Delete: DeleteIcon,
  Save: SaveIcon,
  Add: AddIcon,
  Remove: RemoveIcon,
  Info: InfoIcon,
  Warning: WarningIcon,
  Error: ErrorIcon,
  Check: CheckIcon,
  Close: CloseIcon,
  Folder: FolderIcon,
  FileCopy: FileCopyIcon,
  Bookmark: BookmarkIcon,
  Description: DescriptionIcon,
  Business: BusinessIcon,
  List: ListIcon,
};

const DEFAULT_ICON = FolderIcon;

export function getMenuIcon(iconName?: string): React.ElementType {
  return ICON_MAP[iconName ?? ''] || DEFAULT_ICON;
}

export const ICON_NAMES = Object.keys(ICON_MAP);
