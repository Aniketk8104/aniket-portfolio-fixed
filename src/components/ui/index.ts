/**
 * Base UI Primitives — barrel export
 *
 * All components consume design system tokens via CSS variables (preferred)
 * or tokens.ts for computed cases.
 */

export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { Card } from './Card';
export type { CardProps, CardVariant } from './Card';

export { Section } from './Section';
export type { SectionProps } from './Section';

export { Badge } from './Badge';
export type { BadgeProps, BadgeVariant } from './Badge';

export { Tag } from './Tag';
export type { TagProps } from './Tag';

export { Tabs } from './Tabs';
export type { TabsProps, TabItem } from './Tabs';

export { CodeBlock } from './CodeBlock';
export type { CodeBlockProps } from './CodeBlock';

export { Container } from './Container';
export type { ContainerProps } from './Container';

export { Stack } from './Stack';
export type { StackProps, SpaceToken } from './Stack';

export { Grid } from './Grid';
export type { GridProps } from './Grid';

export { MetricTile } from './MetricTile';
export type { MetricTileProps, MetricTone } from './MetricTile';

export { Eyebrow } from './Eyebrow';
export type { EyebrowProps } from './Eyebrow';

export { Divider } from './Divider';
export type { DividerProps } from './Divider';
