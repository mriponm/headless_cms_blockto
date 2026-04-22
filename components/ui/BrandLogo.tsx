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
        src="/logo-dark.jpeg"
        alt="Blockto"
        width={width}
        height={height}
        priority
        className={`logo-themed logo-dark rounded-[8px] ${className}`}
      />
      <Image
        src="/logo-light.png"
        alt="Blockto"
        width={width}
        height={height}
        priority
        className={`logo-themed logo-light rounded-[8px] ${className}`}
      />
    </>
  );
}
