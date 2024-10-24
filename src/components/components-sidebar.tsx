"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

import * as React from "react"
import {
  AudioWaveform,
  BadgeCheck,
  Bell,
  BookOpen,
  ChevronRight,
  ChevronsUpDown,
  Command,
  CreditCard,
  GalleryVerticalEnd,
  LogOut,
  Plus,
  Sparkles,
  SquareTerminal,
  Users,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"

interface SidebarProps {
  children?: React.ReactNode;
}

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Firm OS",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "KPIs",
      url: "#",
      icon: SquareTerminal,
      items: [
        {
          title: "Internal Dashboards",
          url: "/dashboard/internal",
        },
        {
          title: "Dashboard 2",
          url: "#",
        },
        {
          title: "Dashboard 3",
          url: "#",
        },
      ],
    },
    {
      title: "Management Positions",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Product Manager",
          url: "/dashboard/product-manager",
        },
        {
          title: "GTM Engineer",
          url: "/dashboard/gtm-engineer",
        },
        {
          title: "SCRUM Master",
          url: "/dashboard/scrum-master",
        },
        {
          title: "Product Owner",
          url: "/dashboard/product-owner",
        },
        {
          title: "Customer Success Manager",
          url: "/dashboard/csm",
        },
      ],
    },
    {
      title: "Team Members",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Developer",
          url: "/dashboard/developer",
        },
        {
          title: "Motion Graphics Specialist",
          url: "/dashboard/motion-graphics-specialist",
        },
        {
          title: "Web Developer",
          url: "/dashboard/web-developer",
        },
        {
          title: "GHL Specialist",
          url: "/dashboard/ghl-specialist",
        },
        {
          title: "Outbound Campaign Specialist",
          url: "/dashboard/outbound-campaign-specialist",
        },
        {
          title: "Finance Specialist",
          url: "/dashboard/finance-specialist",
        },
      ]
    },
  ],
}

export function Sidebar_07({ children }: SidebarProps) {
  const [activeTeam, setActiveTeam] = React.useState(data.teams[0])
  const pathname = usePathname()

  // Add this function to check if a menu item or its subitems are active
  const isMenuItemActive = (item: typeof data.navMain[0]) => {
    if (pathname === item.url) return true
    return item.items?.some(subItem => pathname === subItem.url)
  }

  // Add this function to check if a specific subitem is active
  const isSubItemActive = (url: string) => {
    return pathname === url
  }

  const getBreadcrumbs = () => {
    // Remove leading slash and split path into segments
    const pathSegments = pathname.split('/').filter(segment => segment)
    
    // Don't show breadcrumbs on homepage
    if (pathSegments.length === 0) return null

    // Convert path segments to readable format
    const formattedSegments = pathSegments.map(segment => {
      return segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    })

    return (
      <Breadcrumb>
        <BreadcrumbList>
          {pathSegments.length > 0 && (
            <>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </>
          )}
          {formattedSegments.map((segment, index) => (
            <React.Fragment key={segment}>
              <BreadcrumbItem>
                {index === formattedSegments.length - 1 ? (
                  <BreadcrumbPage>{segment}</BreadcrumbPage>
                ) : (
                  // <BreadcrumbLink href={`/${pathSegments.slice(0, index + 1).join('/')}`}>
                  <BreadcrumbLink href="/">
                    {segment}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < formattedSegments.length - 1 && (
                <BreadcrumbSeparator className="hidden md:block" />
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <activeTeam.logo className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {activeTeam.name}
                      </span>
                      <span className="truncate text-xs">
                        {activeTeam.plan}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  align="start"
                  side="bottom"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Teams
                  </DropdownMenuLabel>
                  {data.teams.map((team, index) => (
                    <DropdownMenuItem
                      key={team.name}
                      onClick={() => setActiveTeam(team)}
                      className="gap-2 p-2"
                    >
                      <div className="flex size-6 items-center justify-center rounded-sm border">
                        <team.logo className="size-4 shrink-0" />
                      </div>
                      {team.name}
                      <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 p-2">
                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                      <Plus className="size-4" />
                    </div>
                    <div className="font-medium text-muted-foreground">
                      Add team
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={isMenuItemActive(item)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        tooltip={item.title}
                        className={isMenuItemActive(item) ? "bg-accent" : ""}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton 
                              asChild
                              className={isSubItemActive(subItem.url) ? "bg-accent" : ""}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={data.user.avatar}
                        alt={data.user.name}
                      />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {data.user.name}
                      </span>
                      <span className="truncate text-xs">
                        {data.user.email}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={data.user.avatar}
                          alt={data.user.name}
                        />
                        <AvatarFallback className="rounded-lg">
                          CN
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {data.user.name}
                        </span>
                        <span className="truncate text-xs">
                          {data.user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <Sparkles />
                      Upgrade to Pro
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <BadgeCheck />
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard />
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell />
                      Notifications
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {getBreadcrumbs()}
          </div>
        </header>
        {children} {/* Add this line to render the dashboard */}
      </SidebarInset>
    </SidebarProvider>
  )
}
