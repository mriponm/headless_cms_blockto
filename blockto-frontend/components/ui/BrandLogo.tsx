import Image from "next/image";

interface Props {
  size?: number;
  className?: string;
}

export default function BrandLogo({ size = 36, className = "" }: Props) {
  return (
    <>
      <Image
        src="/logo-icon.svg"
        alt="Blockto"
        width={size}
        height={size}
        priority
        className={`rounded-[10px] logo-themed logo-dark ${className}`}
        style={{ filter: "drop-shadow(0 0 10px rgba(255,106,0,0.35))" }}
      />
      <Image
        src="/logo-icon-light.svg"
        alt="Blockto"
        width={size}
        height={size}
        priority
        className={`rounded-[10px] logo-themed logo-light ${className}`}
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.10)" }}
      />
    </>
  );
}
