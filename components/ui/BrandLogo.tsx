import Image from "next/image";

interface Props {
  height?: number;
  className?: string;
}

export default function BrandLogo({ height = 36, className = "" }: Props) {
  const width = Math.round(height * 3);
  return (
    <>
      <Image
        src="/PNG NEW NO GRADIENT.PNG"
        alt="Blockto"
        width={width}
        height={height}
        quality={100}
        priority
        sizes={`${width * 2}px`}
        className={`logo-themed logo-dark ${className}`}
      />
      <Image
        src="/PNG NEW NO GRADIENT LIGHT.PNG"
        alt="Blockto"
        width={width}
        height={height}
        quality={100}
        priority
        sizes={`${width * 2}px`}
        className={`logo-themed logo-light ${className}`}
      />
    </>
  );
}
