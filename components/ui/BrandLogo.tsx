import Image from "next/image";

interface Props {
  height?: number;
  className?: string;
}

export default function BrandLogo({ height = 36, className = "" }: Props) {
  const width = Math.round(height * 4);
  return (
    <>
      <Image
        src="/white_logo.svg"
        alt="Blockto"
        width={width}
        height={height}
        priority
        className={`logo-themed logo-dark ${className}`}
      />
      <Image
        src="/dark_logo.svg"
        alt="Blockto"
        width={width}
        height={height}
        priority
        className={`logo-themed logo-light ${className}`}
      />
    </>
  );
}
