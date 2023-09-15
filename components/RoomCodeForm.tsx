import { ArrowSmallRightIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

const RoomCodeSchema = z.object({
  code: z.string().min(5).max(5).toUpperCase(),
});

type RoomCodeValues = z.infer<typeof RoomCodeSchema>;

interface Props {
  onCancel: () => void;
}

export default function RoomCodeForm(props: Props) {
  const { register, handleSubmit, formState, getValues } =
    useForm<RoomCodeValues>({
      resolver: zodResolver(RoomCodeSchema),
      mode: 'all',
    });

  const enterRoom = ({ code }: RoomCodeValues) => {
    console.log(code);
  };

  console.log(formState.errors);

  return (
    <form
      onSubmit={handleSubmit(enterRoom)}
      className="flex rounded-full bg-gradient-to-r from-[#210024] to-gray-900 drop-shadow-lg "
    >
      <button
        type="button"
        className="p-2 border-r-1 border-neutral-600 text-gray-400"
        onClick={props.onCancel}
      >
        <XMarkIcon width={36} height={36} />
      </button>
      <input
        autoFocus
        maxLength={5}
        placeholder="Ange rumskod"
        {...register('code')}
        className="bg-transparent text-2xl px-4 w-64 uppercase focus:outline-none text-gray-300"
      />
      <button
        type="submit"
        className={twMerge(
          'p-1 text-gray-400',
          !formState.errors.code &&
            getValues().code?.length > 1 &&
            'text-gray-100',
        )}
      >
        <ArrowSmallRightIcon width={44} height={44} />
      </button>
    </form>
  );
}
