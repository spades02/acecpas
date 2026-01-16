"use client"

import { usePathname } from "next/navigation"
import React, { useEffect, useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function DynamicBreadcrumb() {
  const pathname = usePathname()
  const [segmentLabels, setSegmentLabels] = useState<Record<string, string>>({})

  // 1. Split pathname into segments and remove empty strings
  const pathSegments = pathname.split("/").filter((segment) => segment !== "")

  // 2. Check for UUIDs and fetch names
  useEffect(() => {
    const fetchSegmentName = async (segment: string) => {
      // Simple regex for UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)

      if (isUUID && !segmentLabels[segment]) {
        try {
          // Assume it's a deal ID if it's a UUID for now (or check path context)
          // Ideally we'd have a more robust way, but for this specific request:
          const res = await fetch(`/api/deals/${segment}`)
          if (res.ok) {
            const data = await res.json()
            if (data.deal?.name) {
              setSegmentLabels(prev => ({ ...prev, [segment]: data.deal.name }))
            }
          }
        } catch (err) {
          console.error("Failed to resolve breadcrumb name", err)
        }
      }
    }

    pathSegments.forEach(segment => {
      if (!segmentLabels[segment]) {
        fetchSegmentName(segment)
      }
    })
  }, [pathname, segmentLabels])

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
          // const href = `/${pathSegments.slice(0, index + 1).join("/")}`

          // Use the fetched name if available, otherwise title case the segment
          const label = segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")

          return (
            <React.Fragment key={segment}>
              {/* Add separator ONLY between dynamic segments (not before the first one) */}
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-[200px] truncate">{label}</BreadcrumbPage>
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}