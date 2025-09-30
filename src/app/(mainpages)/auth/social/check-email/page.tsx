// app/link/check-email/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';

export default function CheckEmailPage() {
  const sp = useSearchParams();
  const email = sp.get('email') ?? '';

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold mb-2">이메일을 확인하세요</h1>
      <p className="mb-4">
        {email ? <b>{email}</b> : '등록된 이메일'} 으로 소셜 계정 연결 확인 메일을 보냈어요. 메일의
        버튼을 누르면 연결이 완료되고 자동으로 로그인됩니다.
      </p>
      <ol className="list-decimal pl-5 space-y-1 text-sm">
        <li>메일이 없다면 스팸함을 확인해 주세요.</li>
        <li>1–2분 뒤에도 없으면 다시 시도하거나 메일 재전송을 눌러 주세요.</li>
      </ol>

      <button
        className="mt-6 rounded px-4 py-2 border cursor-pointer disabled:cursor-not-allowed"
        onClick={async () => {
          await fetch(
            new URL('/api/auth/link/resend', process.env.NEXT_PUBLIC_API_BASE_URL!).toString(),
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            }
          );
          alert('재전송했습니다. 메일함을 확인해 주세요.');
        }}
        disabled={!email}
      >
        재전송
      </button>
    </main>
  );
}
