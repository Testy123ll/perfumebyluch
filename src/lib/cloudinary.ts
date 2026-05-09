export const getOptimizedImageUrl = (
  url: string,
  width: number = 400,
  quality: number = 70
): string => {
  if (!url) return "";

  // If it's a Cloudinary URL, add transformations
  if (url.includes("res.cloudinary.com")) {
    return url.replace(
      "/upload/",
      `/upload/f_auto,q_${quality},w_${width},c_fill/`
    );
  }

  // If it's a Supabase URL, add query params
  if (url.includes("supabase.co")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}width=${width}&quality=${quality}&format=webp`;
  }

  return url;
};
