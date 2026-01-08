"use client"

import { usePathname } from "next/navigation"
import React from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
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
      {/* Always show Home as the first item */}
      <BreadcrumbItem>
          <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        {/* Map over path segments to create breadcrumbs */}
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1
          
          // Reconstruct the path for this segment
          const href = `/${pathSegments.slice(0, index + 1).join("/")}`
          
          // Format the text: replace dashes with spaces and capitalize
          const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")

          return (
            <React.Fragment key={href}>
              {index > 0 && <BreadcrumbSeparator />}
              
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}