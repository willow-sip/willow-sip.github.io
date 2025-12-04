interface Props {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export default function StaticImage({ src, alt, width, height, ...props }: Props) {
  const fixedSrc = src.startsWith('/') ? `.${src}` : src;
  return <img src={fixedSrc} alt={alt} width={width} height={height} {...props} />;
}