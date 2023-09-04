export default function Button({
  children,
  ...props
}: JSX.IntrinsicElements['button']) {
  return (
    <button
      {...props}
      className="bg-gradient-to-br uppercase from-[#300042] to-purple-950 hover:from-purple-950 hover:to-purple-900 py-3 px-6 rounded-3xl font-primary text-xl"
    >
      {children}
    </button>
  );
}
