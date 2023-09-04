export default function Button({
  children,
  ...props
}: JSX.IntrinsicElements['button']) {
  return (
    <button
      {...props}
      className="bg-gradient-to-tl uppercase from-cyan-900 to-neutral-950 hover:bg-gradient-to-tl hover:from-cyan-800 hover:to-neutral-900 py-3 px-6 rounded-3xl font-primary text-2xl shadow-stone-200"
    >
      {children}
    </button>
  );
}
