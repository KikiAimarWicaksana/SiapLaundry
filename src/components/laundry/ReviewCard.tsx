import React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { StarRating } from "@/components/ui/StarRating";

export interface ReviewCardProps {
  name: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
  photos?: string[];
}

export function ReviewCard({
  name,
  avatar,
  rating,
  date,
  comment,
  photos,
}: ReviewCardProps) {
  return (
    <article className="flex flex-col gap-3 p-4 bg-canvas-light rounded-lg border border-hairline-light">
      {/* Header: Avatar + Name + Date */}
      <div className="flex items-center gap-3">
        <Avatar src={avatar} name={name} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-body text-[14px] font-[550] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03'] truncate">
            {name}
          </p>
          <p className="font-body text-[12px] font-[420] leading-[1.5] text-shade-50 [font-feature-settings:'ss03']">
            {date}
          </p>
        </div>
      </div>

      {/* Rating */}
      <StarRating value={rating} readonly size="sm" />

      {/* Comment */}
      <p className="font-body text-[14px] font-[420] leading-[1.6] text-ink [font-feature-settings:'ss03']">
        {comment}
      </p>

      {/* Photos (if any) */}
      {photos && photos.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative w-[72px] h-[72px] rounded-md overflow-hidden bg-shade-30"
            >
              <img
                src={photo}
                alt={`Foto ulasan ${index + 1} dari ${name}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export default ReviewCard;
