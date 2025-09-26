//utils\lecturesFetcher.js

import { supabase } from "./supabase";

export async function getLectureUrl(pdf_path, isPrivate = true) {
  if (!isPrivate) {
    const { data } = supabase.storage.from("lectures").getPublicUrl(pdf_path);
    return data.publicUrl; // public URL
  } else {
    const { data, error } = await supabase.storage
      .from("lectures")
      .createSignedUrl(pdf_path, 60 * 60); // 1h expiry
    if (error) throw error;
    return data.signedUrl;
  }
}

export async function getLectures(isPrivate = false) {
  const { data, error } = await supabase
    .from("lectures")
    .select("id, title, pdf_path, created_at, subject")
    .order("created_at", { ascending: false });

  if (error) throw error;

  console.log("Fetched lectures:", data);

  const withUrls = await Promise.all(
    data.map(async (lec) => {
      console.log("Building URL for:", lec.pdf_path);
      return {
        ...lec,
        pdf_url: await getLectureUrl(lec.pdf_path, isPrivate),
      };
    })
  );

  return withUrls;
}
