import type { Revenue } from "@/lib/utils/types"

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })
}

export const formatDateToLocal = (
  dateStr: string,
  locale: string = "en-US",
) => {
  const date = new Date(dateStr)
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  }
  const formatter = new Intl.DateTimeFormat(locale, options)
  return formatter.format(date)
}

export const generateYAxis = (revenue: Revenue[]) => {
  // Calculate what labels we need to display on the y-axis
  // based on highest record and in 1000s
  const yAxisLabels = []
  const highestRecord = Math.max(...revenue.map((month) => month.revenue))
  const topLabel = Math.ceil(highestRecord / 1000) * 1000
  const step = Math.ceil(topLabel / 9) // 9 steps to create 10 labels

  for (let i = topLabel; i >= 0; i -= step) {
    yAxisLabels.push(`$${(i / 1000).toFixed(1)}K`)
  }

  // Ensure we have exactly 10 labels
  while (yAxisLabels.length > 10) {
    yAxisLabels.pop()
  }

  return { yAxisLabels, topLabel }
}

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages]
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages]
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ]
}
