"use client"

import { useCallback, useRef, useState } from "react"
import { Upload } from "lucide-react"

interface Props {
  /** Called with the accepted image File array when files are selected or dropped */
  onFiles: (files: File[]) => void
  /** Prevent interaction while a batch is processing */
  disabled?: boolean
  /**
   * Compact mode: shrinks the zone height when results already exist below it,
   * so the dropzone becomes an "add more" affordance rather than the focal point.
   */
  compact?: boolean
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]

/**
 * Dropzone
 *
 * Supports both drag-and-drop and click-to-browse for multiple images.
 * Filters out any non-image files silently.
 * Glows aqua on drag-enter to match the site's teal accent palette.
 */
export function Dropzone({ onFiles, disabled = false, compact = false }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0) // track nested drag events correctly

  const filterImages = useCallback((fileList: FileList | null): File[] => {
    if (!fileList) return []
    return Array.from(fileList).filter((f) => ACCEPTED_TYPES.includes(f.type))
  }, [])

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    setIsDragging(true)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // required to allow drop
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    const images = filterImages(e.dataTransfer.files)
    if (images.length > 0) onFiles(images)
  }

  const openPicker = () => {
    if (!disabled) inputRef.current?.click()
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Image drop zone — click or drag images here"
      aria-disabled={disabled}
      onClick={openPicker}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openPicker()}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={[
        "group relative flex cursor-pointer select-none flex-col items-center justify-center rounded-3xl border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua/50",
        compact ? "min-h-[120px] py-8 px-6" : "min-h-[340px] px-6 py-20",
        isDragging
          ? "border-aqua/60 bg-aqua/[0.06] shadow-[0_0_60px_rgba(120,220,230,0.18),inset_0_0_40px_rgba(120,220,230,0.07)]"
          : "border-white/15 bg-white/[0.03] hover:border-white/28 hover:bg-white/[0.055]",
        disabled ? "pointer-events-none opacity-50" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Upload icon container */}
      <div
        className={[
          "mb-5 flex shrink-0 items-center justify-center rounded-2xl border transition-all duration-300",
          compact ? "size-11" : "size-16",
          isDragging
            ? "border-aqua/40 bg-aqua/15 shadow-[0_0_30px_rgba(120,220,230,0.25)]"
            : "border-white/20 bg-white/5 group-hover:border-white/30 group-hover:bg-white/8",
        ].join(" ")}
      >
        <Upload
          className={[
            "text-aqua-soft transition-transform duration-300",
            compact ? "size-5" : "size-7",
            isDragging ? "scale-110" : "group-hover:scale-105",
          ].join(" ")}
          aria-hidden="true"
        />
      </div>

      {compact ? (
        /* Compact "add more" label */
        <p className="text-sm font-light text-cloud/55 group-hover:text-cloud/70 transition-colors">
          Add more images
        </p>
      ) : (
        /* Full drop zone labels */
        <>
          <p className="font-serif text-xl font-light text-cloud">
            {isDragging ? "Release to process" : "Drop your images here"}
          </p>
          <p className="mt-2 text-sm font-light text-cloud/50">
            or{" "}
            <span className="text-aqua-soft underline underline-offset-2">
              click to browse
            </span>
          </p>
          <p className="mt-5 text-xs font-light tracking-wide text-cloud/30">
            JPG · PNG · WebP · GIF · AVIF &nbsp;·&nbsp; Multiple files accepted
          </p>
        </>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const images = filterImages(e.target.files)
          if (images.length > 0) onFiles(images)
          // Reset so the same file can be re-uploaded if needed
          e.target.value = ""
        }}
      />
    </div>
  )
}
