/**
 * Default pricing configuration
 * Admin can override these in Firebase at admin/pricing
 */

const DEFAULT_PRICING = {
  // ── Individual Items ──
  items: {
    single_virtue: {
      id: "single_virtue",
      name: "فضيلة تربوية واحدة",
      description: "أي فضيلة من الفضائل المتاحة (3 ألعاب)",
      price: 4,
      type: "virtue",
    },
    single_subject: {
      id: "single_subject",
      name: "مادة تعليمية واحدة",
      description: "رياضيات / عربي / إنجليزي / علوم",
      price: 5,
      type: "subject",
    },
  },

  // ── Packages ──
  packages: {
    golden: {
      id: "golden",
      name: "الباقة الذهبية",
      emoji: "🌟",
      description: "4 مواد + 5 فضائل تربوية (كل الألعاب)",
      price: 20,
      originalPrice: 40,
      childDiscount: 50,
      includes: { virtues: 5, subjects: 4 },
    },
  },

  // ── Multi-child Discounts ──
  childDiscounts: {
    1: 25,  // 25% off every additional child (including 2nd)
    2: 25,
    3: 25,
  },

  // ── Promotions ──
  promotions: {},
};

export default DEFAULT_PRICING;

/**
 * Deep merge admin overrides with default pricing
 * Ensures nested objects (items, packages, etc.) merge correctly
 */
export function mergePricing(adminOverrides) {
  if (!adminOverrides) return { ...DEFAULT_PRICING };

  // Merge defaults with overrides; admin-added items (not in defaults) are kept
  const mergedItems = { ...DEFAULT_PRICING.items };
  if (adminOverrides.items) {
    for (const [key, val] of Object.entries(adminOverrides.items)) {
      mergedItems[key] = { ...(mergedItems[key] || {}), ...val };
    }
  }

  const mergedPackages = { ...DEFAULT_PRICING.packages };
  if (adminOverrides.packages) {
    for (const [key, val] of Object.entries(adminOverrides.packages)) {
      mergedPackages[key] = { ...(mergedPackages[key] || {}), ...val };
    }
  }

  const mergedPromotions = { ...DEFAULT_PRICING.promotions };
  if (adminOverrides.promotions) {
    for (const [key, val] of Object.entries(adminOverrides.promotions)) {
      mergedPromotions[key] = { ...(mergedPromotions[key] || {}), ...val };
    }
  }

  return {
    items: mergedItems,
    packages: mergedPackages,
    childDiscounts: {
      ...DEFAULT_PRICING.childDiscounts,
      ...(adminOverrides.childDiscounts || {}),
    },
    promotions: mergedPromotions,
  };
}

/**
 * Calculate total price for an order
 */
export function calculateOrderTotal(pricing, children) {
  let total = 0;

  children.forEach((child, index) => {
    let childTotal = 0;

    if (child.package) {
      // Using a package
      const pkg = pricing.packages[child.package];
      childTotal = pkg ? pkg.price : 0;
    } else {
      // Individual items
      const virtueCount = (child.virtues || []).length;
      const subjectCount = (child.subjects || []).length;

      childTotal += virtueCount * pricing.items.single_virtue.price;

      childTotal += subjectCount * pricing.items.single_subject.price;
    }

    // Apply multi-child discount (only golden package gets childDiscount)
    if (index > 0) {
      const pkg = child.package ? pricing.packages[child.package] : null;
      const discountPercent = pkg?.childDiscount || 0;
      if (discountPercent > 0) {
        childTotal = childTotal * (1 - discountPercent / 100);
      }
    }

    total += childTotal;
  });

  return Math.round(total);
}
