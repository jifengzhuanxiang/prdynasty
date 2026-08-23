"use client";

import { useEffect } from "react";
import { activateScrollReveal } from "./scroll-reveal-controller";

export default function ScrollReveal() {
  useEffect(() => activateScrollReveal(), []);
  return null;
}
