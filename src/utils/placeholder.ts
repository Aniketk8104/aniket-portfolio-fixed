/**
 * Placeholder utility for marking unset content fields.
 * 
 * This module provides a branded type system for representing content fields
 * that require user authorship. Instead of fabricating content or using fake data,
 * fields can be marked with a Placeholder<T> that preserves type safety while
 * clearly indicating that content is required.
 * 
 * @module utils/placeholder
 */

/**
 * Unique symbol used to brand the Placeholder type.
 * This ensures Placeholder<T> is not structurally compatible with T.
 * The symbol is defined at runtime so it can be used as a property key
 * and detected by the isPlaceholder type guard.
 */
const PlaceholderBrand: unique symbol = Symbol('PlaceholderBrand');

/**
 * A branded type representing an unset content field that requires user authorship.
 * 
 * Placeholder<T> is structurally incompatible with T, preventing accidental use
 * of placeholder values as real content. The __field property stores the field name
 * for rendering meaningful placeholder markers.
 * 
 * @template T - The type of the content field when authored
 */
export type Placeholder<T> = {
  readonly [PlaceholderBrand]: T;
  readonly __field: string;
};

/**
 * Creates a placeholder marker for an unset content field.
 * 
 * Use this helper to mark content fields that require user authorship.
 * The returned placeholder preserves type information while preventing
 * the value from being used as real content.
 * 
 * @template T - The type of the content field when authored
 * @param field - The name of the field (used for rendering placeholder markers)
 * @returns A branded Placeholder<T> value
 * 
 * @example
 * ```ts
 * interface Article {
 *   title: string;
 *   body: string | Placeholder<string>;
 * }
 * 
 * const draft: Article = {
 *   title: "My Article",
 *   body: placeholder<string>("article body")
 * };
 * ```
 */
export const placeholder = <T>(field: string): Placeholder<T> =>
  ({
    [PlaceholderBrand]: undefined as unknown as T,
    __field: field,
  }) as Placeholder<T>;

/**
 * Type guard to check if a value is a Placeholder.
 * 
 * Use this guard to distinguish between authored content and placeholder markers
 * at runtime. This enables conditional rendering logic that shows placeholder
 * markers for unset fields without fabricating content.
 * 
 * @param v - The value to check
 * @returns true if v is a Placeholder, false otherwise
 * 
 * @example
 * ```ts
 * if (isPlaceholder(article.body)) {
 *   return <Placeholder field={article.body.__field} />;
 * } else {
 *   return <RichTextRenderer value={article.body} />;
 * }
 * ```
 */
export const isPlaceholder = (v: unknown): v is Placeholder<unknown> =>
  typeof v === 'object' && v !== null && PlaceholderBrand in (v as object);
