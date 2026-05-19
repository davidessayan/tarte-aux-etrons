import './banner.css'
import type { ConsentManager } from '../core/consent-manager'
import type { BannerLabels, ThemeVars } from '../core/types'
import { frPoop, fr } from '../locales'

export type { BannerLabels, ThemeVars }

export interface BannerOptions {
  manager: ConsentManager
  target?: HTMLElement
  preset?: 'poop' | 'default' | 'none'
  vars?: ThemeVars
  labels?: Partial<BannerLabels>
}

function escape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const VAR_MAP: Record<keyof ThemeVars, string> = {
  accent:        '--tae-accent',
  accentHover:   '--tae-accent-hover',
  accentLight:   '--tae-accent-light',
  accentMid:     '--tae-accent-mid',
  bg:            '--tae-bg',
  border:        '--tae-border',
  stripeA:       '--tae-stripe-a',
  stripeB:       '--tae-stripe-b',
  text:          '--tae-text',
  textMuted:     '--tae-text-muted',
  textSubtle:    '--tae-text-subtle',
  serviceBg:     '--tae-service-bg',
  serviceBorder: '--tae-service-border',
  radius:        '--tae-radius',
}

export class Banner {
  private manager: ConsentManager
  private target: HTMLElement
  private preset: BannerOptions['preset']
  private labels: BannerLabels
  private vars: ThemeVars
  private el: HTMLElement | null = null
  private panel: HTMLElement | null = null
  private unsubscribers: Array<() => void> = []

  constructor(options: BannerOptions) {
    this.manager = options.manager
    this.target = options.target ?? document.body
    this.preset = options.preset ?? 'poop'
    this.vars = options.vars ?? {}

    const baseLabels = this.preset === 'default' ? fr : frPoop
    this.labels = { ...baseLabels, ...options.labels }
  }

  mount(): void {
    this.el = this.buildEl()
    this.applyVars()
    this.target.appendChild(this.el)

    const showUnsub = this.manager.on('banner:show', () => this.show())
    const hideUnsub = this.manager.on('banner:hide', () => this.hide())
    this.unsubscribers.push(showUnsub, hideUnsub)

    if (this.manager.needsBanner()) {
      requestAnimationFrame(() => this.el?.classList.add('tae-banner--in'))
    } else {
      this.el.setAttribute('hidden', '')
    }
  }

  unmount(): void {
    this.el?.remove()
    this.el = null
    this.panel = null
    this.unsubscribers.forEach((fn) => fn())
    this.unsubscribers = []
  }

  show(): void {
    if (!this.el) return
    this.el.removeAttribute('hidden')
    this.el.classList.remove('tae-banner--out')
    this.el.classList.add('tae-banner--in')
  }

  hide(): void {
    if (!this.el) return
    this.el.classList.remove('tae-banner--in')
    this.el.classList.add('tae-banner--out')
    const onEnd = () => {
      this.el?.setAttribute('hidden', '')
      this.el?.classList.remove('tae-banner--out')
      this.el?.removeEventListener('animationend', onEnd)
    }
    this.el.addEventListener('animationend', onEnd)
  }

  private buildEl(): HTMLElement {
    const root = document.createElement('div')
    root.className = 'tae-banner'
    root.setAttribute('role', 'dialog')
    root.setAttribute('aria-modal', 'false')
    root.setAttribute('aria-label', this.labels.title)

    if (this.preset === 'default') {
      root.dataset.theme = 'default'
    }

    root.innerHTML = this.renderHTML()

    root.querySelector('.tae-btn-accept')?.addEventListener('click', () => this.manager.acceptAll())
    root.querySelector('.tae-btn-refuse')?.addEventListener('click', () => this.manager.refuseAll())
    root.querySelector('.tae-btn-customize')?.addEventListener('click', () => this.togglePanel())

    this.panel = root.querySelector('.tae-panel')
    this.panel?.querySelector('.tae-btn-save')?.addEventListener('click', () => this.saveFromPanel())

    return root
  }

  private renderHTML(): string {
    const isPoop = this.preset === 'poop'
    const services = this.manager.getServices()

    const serviceRows = services.map((s) => {
      const accepted = this.manager.isAccepted(s.id)
      const categoryLabel = this.labels.categoryLabels[s.category]

      return `
        <div class="tae-service">
          <label class="tae-service-label">
            <span class="tae-service-info">
              <strong class="tae-service-name">${escape(s.name)}</strong>
              <span class="tae-service-category">${escape(categoryLabel)}</span>
              <span class="tae-service-desc">${escape(s.description)}</span>
            </span>
            <input
              type="checkbox"
              class="tae-toggle"
              data-service-id="${escape(s.id)}"
              role="switch"
              aria-checked="${accepted}"
              ${accepted ? 'checked' : ''}
            />
          </label>
        </div>`
    }).join('')

    return `
      <div class="tae-stripe"></div>
      ${isPoop ? '<span class="tae-icon" aria-hidden="true">💩</span>' : ''}
      <div class="tae-banner-inner">
        <p class="tae-title">${escape(this.labels.title)}</p>
        <p class="tae-desc">${escape(this.labels.description)}</p>
        <div class="tae-actions">
          <button class="tae-btn tae-btn-refuse">${escape(this.labels.refuseAll)}</button>
          <button class="tae-btn tae-btn-customize">${escape(this.labels.customize)}</button>
          <button class="tae-btn tae-btn-accept tae-btn-primary">${escape(this.labels.acceptAll)}</button>
        </div>
        <div class="tae-panel">
          <div class="tae-panel-inner">
            <div class="tae-services">${serviceRows}</div>
            <div class="tae-panel-actions">
              <button class="tae-btn tae-btn-save tae-btn-primary">${escape(this.labels.save)}</button>
            </div>
          </div>
        </div>
      </div>`
  }

  private applyVars(): void {
    if (!this.el) return
    for (const [key, value] of Object.entries(this.vars) as [keyof ThemeVars, string][]) {
      if (value) this.el.style.setProperty(VAR_MAP[key], value)
    }
  }

  private togglePanel(): void {
    this.panel?.classList.toggle('tae-panel--open')
  }

  private saveFromPanel(): void {
    if (!this.panel) return

    this.panel.querySelectorAll<HTMLInputElement>('.tae-toggle').forEach((input) => {
      const { serviceId } = input.dataset
      if (!serviceId) return
      input.checked ? this.manager.accept(serviceId) : this.manager.refuse(serviceId)
    })

    this.hide()
  }
}
