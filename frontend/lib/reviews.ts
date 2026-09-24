import { api } from "@/lib/api";
import { ReviewItem } from "@/types";

type ApiReview = {
  id: number | string;
  author_name: string;
  role_label: string;
  quote: string;
  rating: number;
  created_at: string;
};

function mapApiReview(review: ApiReview): ReviewItem {
  const name = review.author_name || "Użytkownik";

  return {
    id: String(review.id),
    quote: review.quote,
    name,
    role: review.role_label || "Użytkownik",
    initial: name.charAt(0).toUpperCase(),
    rating: review.rating,
    createdAt: review.created_at,
  };
}

export async function getReviews() {
  const response = await api.get<ApiReview[]>("/reviews/");
  return response.data.map(mapApiReview);
}

export async function createReview(payload: { name: string; role: string; quote: string; rating: number }) {
  const response = await api.post<ApiReview>("/reviews/", {
    author_name: payload.name,
    role_label: payload.role,
    quote: payload.quote,
    rating: payload.rating,
  });

  return mapApiReview(response.data);
}
