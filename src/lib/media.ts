const CLOUDINARY_CLOUD = "dp4auwl1h";

export const getOptimizedVideoUrl = (url: string): string => {
  if (!url) return "";

  if (url.includes("res.cloudinary.com")) {
    if (url.includes("/upload/") && !url.includes("f_auto")) {
      return url.replace("/upload/", "/upload/f_auto,q_auto,vc_auto,w_600/");
    }
    return url;
  }

  if (url.includes("supabase.co")) {
    const encoded = encodeURIComponent(url);
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/fetch/f_auto,q_auto,vc_auto,w_600/${encoded}`;
  }

  return url;
};

export const getOptimizedImageUrl = (
  url: string,
  width: number = 400,
  quality: number = 70
): string => {
  if (!url) return "";

  if (url.includes("res.cloudinary.com")) {
    if (url.includes("/upload/") && !url.includes("f_auto")) {
      return url.replace(
        "/upload/",
        `/upload/f_auto,q_${quality},w_${width},c_fill/`
      );
    }
    return url;
  }

  if (url.includes("supabase.co")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}width=${width}&quality=${quality}&format=webp`;
  }

  return url;
};

export const getVideoThumbnail = (videoUrl: string): string => {
  if (!videoUrl) return "";

  if (videoUrl.includes("res.cloudinary.com")) {
    return videoUrl
      .replace("/video/upload/", "/video/upload/so_0,f_jpg,q_auto,w_400/")
      .replace(/\.(mp4|mov|avi|webm)$/, ".jpg");
  }

  return "";
};
