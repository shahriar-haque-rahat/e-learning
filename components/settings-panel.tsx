"use client"

import { useState, useEffect } from "react"
import { useUISettings } from "@/lib/providers/ui-settings-provider"
import type { UiPreset } from "@/lib/types"
import * as api from "@/lib/api/mock"
import { Button } from "@/components/ui/button"
import { FiX, FiSave, FiRotateCcw, FiCopy, FiCheck } from "react-icons/fi"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SettingsPanelProps {
  onClose: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { tokens, updateTokens, resetTokens } = useUISettings()
  const [presets, setPresets] = useState<UiPreset[]>([])
  const [presetName, setPresetName] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const loadPresets = async () => {
      const p = await api.listPresets()
      setPresets(p)
    }
    loadPresets()
  }, [])

  const handleModeChange = (mode: "light" | "dark" | "system") => {
    updateTokens({ mode })
  }

  const handleContrastChange = (contrast: "normal" | "high") => {
    updateTokens({ contrast })
  }

  const handleDensityChange = (density: "comfortable" | "compact") => {
    updateTokens({ density })
  }

  const handleNavLayoutChange = (navLayout: "integrated" | "rail" | "overlay" | "hidden") => {
    updateTokens({ navLayout })
  }

  const handleBodyLayoutChange = (bodyLayout: "full" | "centered" | "sidebar-content" | "grid") => {
    updateTokens({ bodyLayout })
  }

  const handleLanguageChange = (language: "en" | "bn") => {
    updateTokens({ language })
  }

  const handlePrimaryColorChange = (color: string) => {
    updateTokens({
      colors: { ...tokens.colors, primary: color },
    })
  }

  const handleSecondaryColorChange = (color: string) => {
    updateTokens({
      colors: { ...tokens.colors, secondary: color },
    })
  }

  const handleAccentColorChange = (color: string) => {
    updateTokens({
      colors: { ...tokens.colors, accent: color },
    })
  }

  const handleBaseSizeChange = (size: number) => {
    updateTokens({
      typography: { ...tokens.typography, baseSize: size },
    })
  }

  const handleHeadingWeightChange = (weight: number) => {
    updateTokens({
      typography: { ...tokens.typography, headingWeight: weight },
    })
  }

  const handleBodyWeightChange = (weight: number) => {
    updateTokens({
      typography: { ...tokens.typography, bodyWeight: weight },
    })
  }

  const handleRadiusChange = (radius: number) => {
    updateTokens({ radius })
  }

  const handleSpacingScaleChange = (scale: number) => {
    updateTokens({ spacingScale: scale })
  }

  const handleShowDividersChange = (show: boolean) => {
    updateTokens({ showDividers: show })
  }

  const handleShowNavLabelsChange = (show: boolean) => {
    updateTokens({ showNavLabels: show })
  }

  const handleSavePreset = async () => {
    if (!presetName.trim()) return

    const preset = await api.createPreset(presetName, tokens)
    setPresets([...presets, preset])
    setPresetName("")
  }

  const handleLoadPreset = async (id: string) => {
    const newTokens = await api.loadPreset(id)
    await updateTokens(newTokens)
  }

  const handleDeletePreset = async (id: string) => {
    await api.deletePreset(id)
    setPresets(presets.filter((p) => p.id !== id))
  }

  const generateShareUrl = () => {
    const encoded = btoa(JSON.stringify(tokens))
    const url = `${window.location.origin}?theme=${encoded}`
    return url
  }

  const copyShareUrl = () => {
    const url = generateShareUrl()
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center sm:justify-end">
      <div className="w-full sm:w-96 bg-background border-l border-border rounded-t-lg sm:rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
          <h2 className="text-xl font-bold">Settings</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <FiX className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="w-full rounded-none border-b border-border">
            <TabsTrigger value="appearance" className="flex-1">
              Appearance
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex-1">
              Typography
            </TabsTrigger>
            <TabsTrigger value="presets" className="flex-1">
              Presets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="p-6 space-y-6">
            {/* Mode */}
            <div>
              <label className="text-sm font-semibold block mb-3">Mode</label>
              <div className="flex gap-2">
                {(["light", "dark", "system"] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={tokens.mode === mode ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleModeChange(mode)}
                    className="flex-1 capitalize"
                  >
                    {mode}
                  </Button>
                ))}
              </div>
            </div>

            {/* Contrast */}
            <div>
              <label className="text-sm font-semibold block mb-3">Contrast</label>
              <div className="flex gap-2">
                {(["normal", "high"] as const).map((contrast) => (
                  <Button
                    key={contrast}
                    variant={tokens.contrast === contrast ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleContrastChange(contrast)}
                    className="flex-1 capitalize"
                  >
                    {contrast}
                  </Button>
                ))}
              </div>
            </div>

            {/* Density */}
            <div>
              <label className="text-sm font-semibold block mb-3">Density</label>
              <div className="flex gap-2">
                {(["comfortable", "compact"] as const).map((density) => (
                  <Button
                    key={density}
                    variant={tokens.density === density ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDensityChange(density)}
                    className="flex-1 capitalize"
                  >
                    {density}
                  </Button>
                ))}
              </div>
            </div>

            {/* Navigation Layout */}
            <div>
              <label className="text-sm font-semibold block mb-3">Navigation Layout</label>
              <div className="grid grid-cols-2 gap-2">
                {(["integrated", "rail", "overlay", "hidden"] as const).map((layout) => (
                  <Button
                    key={layout}
                    variant={tokens.navLayout === layout ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNavLayoutChange(layout)}
                    className="capitalize"
                  >
                    {layout}
                  </Button>
                ))}
              </div>
            </div>

            {/* Body Layout */}
            <div>
              <label className="text-sm font-semibold block mb-3">Body Layout</label>
              <div className="grid grid-cols-2 gap-2">
                {(["full", "centered", "sidebar-content", "grid"] as const).map((layout) => (
                  <Button
                    key={layout}
                    variant={tokens.bodyLayout === layout ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleBodyLayoutChange(layout)}
                    className="capitalize text-xs"
                  >
                    {layout === "sidebar-content" ? "Sidebar" : layout}
                  </Button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="text-sm font-semibold block mb-3">Language</label>
              <div className="flex gap-2">
                {(["en", "bn"] as const).map((lang) => (
                  <Button
                    key={lang}
                    variant={tokens.language === lang ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLanguageChange(lang)}
                    className="flex-1 uppercase"
                  >
                    {lang}
                  </Button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Colors</h3>

              <div>
                <label className="text-xs font-medium block mb-2">Primary</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={tokens.colors.primary}
                    onChange={(e) => handlePrimaryColorChange(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border border-border"
                  />
                  <input
                    type="text"
                    value={tokens.colors.primary}
                    onChange={(e) => handlePrimaryColorChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium block mb-2">Secondary</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={tokens.colors.secondary || "#7c3aed"}
                    onChange={(e) => handleSecondaryColorChange(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border border-border"
                  />
                  <input
                    type="text"
                    value={tokens.colors.secondary || ""}
                    onChange={(e) => handleSecondaryColorChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium block mb-2">Accent</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={tokens.colors.accent || "#06b6d4"}
                    onChange={(e) => handleAccentColorChange(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border border-border"
                  />
                  <input
                    type="text"
                    value={tokens.colors.accent || ""}
                    onChange={(e) => handleAccentColorChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Border Radius */}
            <div>
              <label className="text-sm font-semibold block mb-3">Border Radius: {tokens.radius}px</label>
              <input
                type="range"
                min="0"
                max="16"
                value={tokens.radius}
                onChange={(e) => handleRadiusChange(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Spacing Scale */}
            <div>
              <label className="text-sm font-semibold block mb-3">Spacing Scale: {tokens.spacingScale}x</label>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.1"
                value={tokens.spacingScale}
                onChange={(e) => handleSpacingScaleChange(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dividers"
                  checked={tokens.showDividers}
                  onChange={(e) => handleShowDividersChange(e.target.checked)}
                  className="w-4 h-4 rounded border border-border"
                />
                <label htmlFor="dividers" className="text-sm font-medium">
                  Show Dividers
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="navLabels"
                  checked={tokens.showNavLabels}
                  onChange={(e) => handleShowNavLabelsChange(e.target.checked)}
                  className="w-4 h-4 rounded border border-border"
                />
                <label htmlFor="navLabels" className="text-sm font-medium">
                  Show Navigation Labels
                </label>
              </div>
            </div>

            {/* Reset */}
            <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={resetTokens}>
              <FiRotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>
          </TabsContent>

          <TabsContent value="typography" className="p-6 space-y-6">
            {/* Base Font Size */}
            <div>
              <label className="text-sm font-semibold block mb-3">Base Font Size: {tokens.typography.baseSize}px</label>
              <input
                type="range"
                min="12"
                max="20"
                value={tokens.typography.baseSize}
                onChange={(e) => handleBaseSizeChange(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Heading Weight */}
            <div>
              <label className="text-sm font-semibold block mb-3">
                Heading Weight: {tokens.typography.headingWeight}
              </label>
              <div className="flex gap-2">
                {[400, 500, 600, 700, 800, 900].map((weight) => (
                  <Button
                    key={weight}
                    variant={tokens.typography.headingWeight === weight ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleHeadingWeightChange(weight)}
                  >
                    {weight}
                  </Button>
                ))}
              </div>
            </div>

            {/* Body Weight */}
            <div>
              <label className="text-sm font-semibold block mb-3">Body Weight: {tokens.typography.bodyWeight}</label>
              <div className="flex gap-2">
                {[300, 400, 500, 600].map((weight) => (
                  <Button
                    key={weight}
                    variant={tokens.typography.bodyWeight === weight ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleBodyWeightChange(weight)}
                  >
                    {weight}
                  </Button>
                ))}
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className="text-sm font-semibold block mb-3">Font Family</label>
              <select
                value={tokens.typography.font}
                onChange={(e) =>
                  updateTokens({
                    typography: { ...tokens.typography, font: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-border rounded text-sm"
              >
                <option value="Geist">Geist</option>
                <option value="system-ui">System UI</option>
                <option value="serif">Serif</option>
                <option value="monospace">Monospace</option>
              </select>
            </div>

            {/* Preview */}
            <div className="p-4 border border-border rounded bg-muted/50">
              <h3 style={{ fontWeight: tokens.typography.headingWeight }} className="text-lg mb-2">
                Heading Preview
              </h3>
              <p style={{ fontWeight: tokens.typography.bodyWeight }} className="text-sm">
                Body text preview with current settings
              </p>
            </div>
          </TabsContent>

          <TabsContent value="presets" className="p-6 space-y-4">
            {/* Save Preset */}
            <div className="space-y-2">
              <label className="text-sm font-semibold block">Save Current Settings</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Preset name..."
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded text-sm"
                />
                <Button size="sm" onClick={handleSavePreset} disabled={!presetName.trim()} className="gap-2">
                  <FiSave className="w-4 h-4" />
                  Save
                </Button>
              </div>
            </div>

            {/* Share Settings */}
            <div className="space-y-2">
              <label className="text-sm font-semibold block">Share Settings</label>
              <Button size="sm" onClick={copyShareUrl} className="w-full gap-2">
                {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Share Link"}
              </Button>
            </div>

            {/* Presets List */}
            <div className="space-y-2">
              <label className="text-sm font-semibold block">Saved Presets</label>
              {presets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No presets saved yet</p>
              ) : (
                <div className="space-y-2">
                  {presets.map((preset) => (
                    <div key={preset.id} className="flex items-center justify-between p-3 border border-border rounded">
                      <span className="text-sm font-medium">{preset.name}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleLoadPreset(preset.id)}>
                          Load
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeletePreset(preset.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
