/**
 * Tabs — accessible tabbed interface implementing WAI-ARIA roving tabindex.
 * Supports both controlled and uncontrolled modes.
 * Consumes color, typography, and spacing tokens via CSS variables.
 *
 * WAI-ARIA pattern:
 * - Tab list has role="tablist"
 * - Each tab has role="tab", aria-selected, aria-controls
 * - Each panel has role="tabpanel", aria-labelledby
 * - Arrow keys move focus between tabs (roving tabindex)
 * - Home/End move to first/last tab
 * - Only the active tab has tabindex="0"; others have tabindex="-1"
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 * @see Requirements 9.2, 16.1
 */
import React, { useCallback, useId, useRef, useState } from 'react';

export interface TabItem {
  /** Unique key for the tab */
  key: string;
  /** Tab label */
  label: React.ReactNode;
  /** Tab panel content */
  content: React.ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Tab items */
  items: TabItem[];
  /** Controlled active tab key */
  activeKey?: string;
  /** Default active tab key (uncontrolled) */
  defaultActiveKey?: string;
  /** Callback when active tab changes */
  onChange?: (key: string) => void;
}

/** CSS for focus-visible on tabs */
const tabFocusStyle = `
  .ui-tab:focus-visible {
    outline: 2px solid var(--color-accent-primary);
    outline-offset: -2px;
    border-radius: var(--radius-sm);
  }
`;

let tabStyleInjected = false;
function injectTabStyles() {
  if (tabStyleInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = tabFocusStyle;
  document.head.appendChild(style);
  tabStyleInjected = true;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeKey: controlledKey,
  defaultActiveKey,
  onChange,
  style,
  ...rest
}) => {
  injectTabStyles();

  const baseId = useId();
  const tabListRef = useRef<HTMLDivElement>(null);

  // Determine initial active key
  const firstEnabledKey = items.find((item) => !item.disabled)?.key ?? items[0]?.key ?? '';
  const [internalKey, setInternalKey] = useState(defaultActiveKey ?? firstEnabledKey);

  const isControlled = controlledKey !== undefined;
  const activeTabKey = isControlled ? controlledKey : internalKey;

  const setActiveKey = useCallback(
    (key: string) => {
      if (!isControlled) {
        setInternalKey(key);
      }
      onChange?.(key);
    },
    [isControlled, onChange],
  );

  const getTabId = (key: string) => `tab-${baseId}-${key}`;
  const getPanelId = (key: string) => `panel-${baseId}-${key}`;

  const enabledItems = items.filter((item) => !item.disabled);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const currentIndex = enabledItems.findIndex((item) => item.key === activeTabKey);
      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = (currentIndex + 1) % enabledItems.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = (currentIndex - 1 + enabledItems.length) % enabledItems.length;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = enabledItems.length - 1;
          break;
        default:
          return;
      }

      if (nextIndex !== null) {
        const nextItem = enabledItems[nextIndex];
        setActiveKey(nextItem.key);
        // Move focus to the next tab
        const tabEl = tabListRef.current?.querySelector<HTMLButtonElement>(
          `[data-tab-key="${nextItem.key}"]`,
        );
        tabEl?.focus();
      }
    },
    [activeTabKey, enabledItems, setActiveKey],
  );

  const activePanel = items.find((item) => item.key === activeTabKey);

  return (
    <div style={style} {...rest}>
      {/* Tab list */}
      <div
        ref={tabListRef}
        role="tablist"
        aria-orientation="horizontal"
        style={{
          display: 'flex',
          gap: 'var(--space-1)',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '0',
        }}
      >
        {items.map((item) => {
          const isActive = item.key === activeTabKey;
          const isDisabled = item.disabled ?? false;

          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              id={getTabId(item.key)}
              aria-selected={isActive}
              aria-controls={getPanelId(item.key)}
              aria-disabled={isDisabled || undefined}
              tabIndex={isActive ? 0 : -1}
              data-tab-key={item.key}
              className="ui-tab"
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled) setActiveKey(item.key);
              }}
              onKeyDown={handleKeyDown}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${isActive ? 'var(--color-accent-primary)' : 'transparent'}`,
                padding: 'var(--space-3) var(--space-4)',
                marginBottom: '-1px',
                fontSize: 'var(--font-size-body)',
                lineHeight: 'var(--line-height-body)',
                fontFamily: 'var(--font-sans)',
                fontWeight: isActive ? 600 : 400,
                color: isDisabled
                  ? 'var(--color-text-muted)'
                  : isActive
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-secondary)',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.5 : 1,
                transition: `color var(--duration-fast) var(--ease-standard), 
                             border-color var(--duration-fast) var(--ease-standard)`,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Tab panel */}
      {activePanel && (
        <div
          role="tabpanel"
          id={getPanelId(activePanel.key)}
          aria-labelledby={getTabId(activePanel.key)}
          tabIndex={0}
          style={{
            paddingTop: 'var(--space-6)',
          }}
        >
          {activePanel.content}
        </div>
      )}
    </div>
  );
};

export default Tabs;
