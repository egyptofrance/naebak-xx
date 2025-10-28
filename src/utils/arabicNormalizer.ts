/**
 * Arabic Text Normalizer
 * يقوم بتطبيع النصوص العربية لاكتشاف التكرارات بشكل أفضل
 */

/**
 * تطبيع الحروف العربية المتشابهة
 * Normalizes similar Arabic characters to a standard form
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';

  let normalized = text;

  // تحويل إلى lowercase
  normalized = normalized.toLowerCase();

  // إزالة التشكيل (diacritics)
  normalized = normalized.replace(/[\u064B-\u065F]/g, ''); // Remove Arabic diacritics
  normalized = normalized.replace(/[\u0670]/g, ''); // Remove Arabic letter superscript alef

  // توحيد الألف
  // Normalize different forms of Alef to plain Alef (ا)
  normalized = normalized.replace(/[أإآٱ]/g, 'ا');

  // توحيد الهمزة
  // Normalize Hamza variations
  normalized = normalized.replace(/[ؤئ]/g, 'ء');

  // توحيد الياء
  // Normalize Ya variations (ي and ى)
  normalized = normalized.replace(/[ىي]/g, 'ي');

  // توحيد التاء المربوطة والهاء
  // Normalize Ta Marbuta (ة) to Ha (ه)
  normalized = normalized.replace(/ة/g, 'ه');

  // إزالة المسافات الزائدة
  // Remove extra whitespace
  normalized = normalized.trim().replace(/\s+/g, ' ');

  return normalized;
}

/**
 * مقارنة نصين عربيين مع التطبيع
 * Compares two Arabic texts after normalization
 */
export function areTextsEqual(text1: string, text2: string): boolean {
  return normalizeArabicText(text1) === normalizeArabicText(text2);
}

/**
 * حساب نسبة التشابه بين نصين
 * Calculates similarity percentage between two texts
 * Uses Levenshtein Distance (with order sensitivity)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1;

  // Normalize both strings
  const normalized1 = normalizeArabicText(str1);
  const normalized2 = normalizeArabicText(str2);

  if (normalized1 === normalized2) return 1;

  // Calculate Levenshtein Distance
  const distance = levenshteinDistance(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);
  
  if (maxLength === 0) return 1;
  
  // Convert distance to similarity (1 - normalized distance)
  return 1 - (distance / maxLength);
}

/**
 * حساب Levenshtein Distance بين نصين
 * Calculates the minimum number of single-character edits needed
 * to change one string into another (preserves order)
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Create a 2D array for dynamic programming
  const matrix: number[][] = [];
  
  // Initialize first column
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  
  // Initialize first row
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  // Fill the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[len1][len2];
}



/**
 * البحث عن التكرارات في قائمة من النصوص
 * Finds duplicates in a list of texts
 */
export interface DuplicateGroup {
  normalized: string;
  items: Array<{
    id: string;
    originalText: string;
    similarity: number;
  }>;
}

export function findDuplicates(
  items: Array<{ id: string; text: string }>,
  similarityThreshold: number = 0.85
): DuplicateGroup[] {
  const groups = new Map<string, DuplicateGroup>();

  // Group by normalized text first (exact matches)
  for (const item of items) {
    const normalized = normalizeArabicText(item.text);
    
    if (!groups.has(normalized)) {
      groups.set(normalized, {
        normalized,
        items: []
      });
    }

    groups.get(normalized)!.items.push({
      id: item.id,
      originalText: item.text,
      similarity: 1.0
    });
  }

  // Find similar groups (fuzzy matches)
  const allGroups = Array.from(groups.values());
  const mergedGroups: DuplicateGroup[] = [];
  const processed = new Set<string>();

  for (let i = 0; i < allGroups.length; i++) {
    if (processed.has(allGroups[i].normalized)) continue;

    const currentGroup = allGroups[i];
    processed.add(currentGroup.normalized);

    // Look for similar groups
    for (let j = i + 1; j < allGroups.length; j++) {
      if (processed.has(allGroups[j].normalized)) continue;

      const similarity = calculateSimilarity(
        currentGroup.normalized,
        allGroups[j].normalized
      );

      if (similarity >= similarityThreshold) {
        // Merge groups
        for (const item of allGroups[j].items) {
          currentGroup.items.push({
            ...item,
            similarity
          });
        }
        processed.add(allGroups[j].normalized);
      }
    }

    // Only include groups with duplicates
    if (currentGroup.items.length > 1) {
      // Sort by similarity (highest first)
      currentGroup.items.sort((a, b) => b.similarity - a.similarity);
      mergedGroups.push(currentGroup);
    }
  }

  // Sort groups by number of duplicates (most first)
  mergedGroups.sort((a, b) => b.items.length - a.items.length);

  return mergedGroups;
}

/**
 * اختبار ما إذا كان النص يحتوي على أحرف عربية
 * Tests if text contains Arabic characters
 */
export function hasArabicCharacters(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

