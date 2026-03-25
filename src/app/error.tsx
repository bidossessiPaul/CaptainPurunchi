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
          Nous sommes désolés, quelque chose ne s'est pas passé comme prévu.
        </p>
        <button onClick={reset}>Réessayer</button>
      </div>
    </div>
  );
}
