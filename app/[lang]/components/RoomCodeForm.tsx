import { Lang, getTranslation } from '@/language';
import { ArrowSmallRightIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

const CODE_LENGTH = 5;

const RoomCodeSchema = z.object({
  code: z.string().min(CODE_LENGTH).max(CODE_LENGTH).toUpperCase(),
});

type RoomCodeValues = z.infer<typeof RoomCodeSchema>;

interface Props {
  onCancel: () => void;
  lang: Lang;
}

export default function RoomCodeForm(props: Props) {
  const t = getTranslation(props.lang);
  const router = useRouter();
  const { register, handleSubmit, formState, getValues } = useForm<RoomCodeValues>({
    resolver: zodResolver(RoomCodeSchema),
    mode: 'all',
  });

  const enterRoom = ({ code }: RoomCodeValues) => router.push('room/' + code);

  return (
    <form
      onSubmit={handleSubmit(enterRoom)}
      className="flex rounded-full bg-gradient-to-r from-[#210024] to-gray-900 drop-shadow-lg"
    >
      <button
        type="button"
        className="p-2 border-r-1 border-zinc-600 text-gray-400"
        onClick={props.onCancel}
      >
        <XMarkIcon width={36} height={36} />
      </button>
      <input
        autoFocus
        maxLength={CODE_LENGTH}
        placeholder={t('Enter room code')}
        {...register('code')}
        className="bg-transparent text-2xl px-4 w-64 uppercase focus:outline-none text-gray-300"
      />
      <button
        type="submit"
        className={twMerge(
          'p-1 text-gray-400',
          !formState.errors.code && getValues().code?.length === CODE_LENGTH && 'text-gray-100',
        )}
      >
        <ArrowSmallRightIcon width={44} height={44} />
      </button>
    </form>
  );
}
