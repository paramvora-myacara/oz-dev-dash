import React from "react";
import * as allExports from "lucide-react";

// `lucide-react` exports `createLucideIcon` and `icons` which are not icon components.
// We destructure them out, so `iconComponents` only contains icon components.
const { createLucideIcon, icons, ...iconComponents } = allExports;

export const iconMap: { [key: string]: React.ComponentType<any> } = iconComponents; 