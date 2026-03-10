/**
 * Default pricing configuration
 * Admin can override these in Firebase at admin/pricing
 */

const DEFAULT_PRICING = {
  // ── Individual Items ──
  items: {
    single_virtue: {
      id: "single_virtue",
      name: "قيمة تربوية واحدة",
      description: "أي فضيلة من الفضائل المتاحة",
      price: 5,
      type: "virtue",
    },
    single_subject: {
      id: "single_subject",
      name: "مادة تعليمية واحدة",
      description: "رياضيات / عربي / إنجليزي / علوم",
      price: 10,
      type: "subject",
    },
  },

  // ── Packages ──
  packages: {
    virtue_bundle: {
      id: "virtue_bundle",
      name: "باقة العيد",
      emoji: "🎁",
      description: "5 قيم تربوية معاً",
      price: 20,
      originalPrice: 25,
      includes: { virtues: 5, subjects: 0 },
    },
    excellence: {
      id: "excellence",
      name: "باقة التفوق",
      emoji: "📚",
      description: "مادة + 5 قيم تربوية",
      price: 25,
      originalPrice: 35,
      includes: { virtues: 5, subjects: 1 },
    },
    golden: {
      id: "golden",
      name: "الباقة الذهبية",
      emoji: "🌟",
      description: "4 مواد + 5 قيم تربوية",
      price: 49,
      originalPrice: 65,
      includes: { virtues: 5, subjects: 4 },
    },
  },

  // ── Multi-child Discounts ──
  childDiscounts: {
    2: 15,  // 15% off second child
    3: 25,  // 25% off 3rd+
  },

  // ── Promotions ──
  promotions: {
    launch: {
      id: "launch",
      name: "عرض الإطلاق",
      description: "خصم 30% لمن يسجل قبل العيد",
      discountPercent: 30,
      active: true,
    },
  },
};

export default DEFAULT_PRICING;

/**
 * Deep merge admin overrides with default pricing
 * Ensures nested objects (items, packages, etc.) merge correctly
 */
export function mergePricing(adminOverrides) {
  if (!adminOverrides) return { ...DEFAULT_PRICING };

  return {
    items: {
      ...DEFAULT_PRICING.items,
      ...Object.fromEntries(
        Object.entries(DEFAULT_PRICING.items).map(([key, val]) => [
          key,
          { ...val, ...(adminOverrides.items?.[key] || {}) },
        ])
      ),
    },
    packages: {
      ...DEFAULT_PRICING.packages,
      ...Object.fromEntries(
        Object.entries(DEFAULT_PRICING.packages).map(([key, val]) => [
          key,
          { ...val, ...(adminOverrides.packages?.[key] || {}) },
        ])
      ),
    },
    childDiscounts: {
      ...DEFAULT_PRICING.childDiscounts,
      ...(adminOverrides.childDiscounts || {}),
    },
    promotions: {
      ...DEFAULT_PRICING.promotions,
      ...Object.fromEntries(
        Object.entries(DEFAULT_PRICING.promotions).map(([key, val]) => [
          key,
          { ...val, ...(adminOverrides.promotions?.[key] || {}) },
        ])
      ),
    },
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

      // Check if 5 virtues → use bundle price
      if (virtueCount >= 5) {
        childTotal += pricing.packages.virtue_bundle?.price || (virtueCount * pricing.items.single_virtue.price);
      } else {
        childTotal += virtueCount * pricing.items.single_virtue.price;
      }

      childTotal += subjectCount * pricing.items.single_subject.price;
    }

    // Apply multi-child discount
    if (index > 0) {
      const discountKey = Math.min(index + 1, 3);
      const discountPercent = pricing.childDiscounts[discountKey] || 0;
      childTotal = childTotal * (1 - discountPercent / 100);
    }

    total += childTotal;
  });

  return Math.round(total);
}
