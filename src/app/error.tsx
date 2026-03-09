"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-page">
      <div>
        <h2>Une erreur est survenue</h2>
        <p>
          Nous sommes d&eacute;sol&eacute;s, quelque chose ne s&apos;est pas pass&eacute; comme pr&eacute;vu.
        </p>
        <button onClick={reset}>R&eacute;essayer</button>
      </div>
    </div>
  );
}
