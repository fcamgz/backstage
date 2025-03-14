/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export function extractProps(
  props: {
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    as?: keyof JSX.IntrinsicElements;
    [key: string]: any;
  },
  propDefs: { [key: string]: any },
) {
  let className: string[] = (props.className || '').split(' ');
  let style: React.CSSProperties = { ...props.style };
  const hasProp = (key: string) => props.hasOwnProperty(key);

  for (const key in propDefs) {
    // Check if the prop is present or has a default value
    if (!hasProp(key) && !propDefs[key].hasOwnProperty('default')) {
      continue; // Skip processing if neither is present
    }

    const value = hasProp(key) ? props[key] : propDefs[key].default;
    const propDefsValues = propDefs[key].values;
    const propDefsCustomProperties = propDefs[key].customProperties;
    const propDefsClassName = propDefs[key].className;
    const isResponsive = propDefs[key].responsive;

    const handleValue = (val: string, prefix: string = '') => {
      // Skip adding class name if the key is "as"
      if (key === 'as') return;

      if (propDefsValues.includes(val)) {
        className.push(`${prefix}${propDefsClassName}-${val}`);
      } else {
        const customPropertyKey =
          isResponsive && prefix
            ? `${propDefsCustomProperties}-${prefix.slice(0, -1)}`
            : propDefsCustomProperties;
        (style as any)[customPropertyKey] = val;
        className.push(`${prefix}${propDefsClassName}`);
      }
    };

    if (isResponsive && typeof value === 'object') {
      // Handle responsive object values
      for (const breakpoint in value) {
        const prefix = breakpoint === 'initial' ? '' : `${breakpoint}:`;
        handleValue(value[breakpoint], prefix);
      }
    } else {
      handleValue(value);
    }
  }

  // Ensure keys from props that are defined in propDefs are removed
  const cleanedProps = Object.keys(props).reduce((acc, key) => {
    if (!propDefs.hasOwnProperty(key)) {
      acc[key] = props[key];
    }
    return acc;
  }, {} as { [key: string]: any });

  const newClassNames = className
    .filter(name => name && name.trim() !== '')
    .join(' ');

  return { ...cleanedProps, className: newClassNames, style };
}
