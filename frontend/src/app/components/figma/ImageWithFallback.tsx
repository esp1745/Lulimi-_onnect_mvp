import { useState } from "react";

const ERROR_IMG_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 88 88' width='88' height='88'%3E%3Crect width='88' height='88' rx='6' fill='%23eee'/%3E%3Cpath d='M20 62l14-18 10 12 8-10 16 16z' fill='%23ccc'/%3E%3Ccircle cx='32' cy='30' r='6' fill='%23ccc'/%3E%3C/svg%3E";

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false);
  const { src, alt, style, className, ...rest } = props;

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ""}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setDidError(true)}
      {...rest}
    />
  );
}
