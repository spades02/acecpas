"use client"

import { usePathname } from "next/navigation"
import React from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function DynamicBreadcrumb() {
  const pathname = usePathname()
  
  // 1. Split pathname into segments and remove empty strings
  const pathSegments = pathname.split("/").filter((segment) => segment !== "")

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        
        {/* 1. Only show "Dashboard" if we are on the homepage (no path segments) */}
        {pathSegments.length === 0 && (
          <BreadcrumbItem>
            {/* Using BreadcrumbPage since it's the current active page */}
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        )}
  
        {/* 2. Map over path segments for other pages */}
        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join("/")}`
          const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
  
          return (
            <React.Fragment key={href}>
              {/* Add separator ONLY between dynamic segments (not before the first one) */}
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}