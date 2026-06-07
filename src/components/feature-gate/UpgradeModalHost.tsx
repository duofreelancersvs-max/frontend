/**
 * UpgradeModalHost
 *
 * Single instance, mounted at the App root, that renders the global
 * UpgradeModal driven by `useUpgradeModalStore`. The store is fed by
 * the 402 PLAN_LIMIT_EXCEEDED response interceptor in `axios-client.ts`
 * and by inline pre-flight gates (e.g. ProjectApplicationModal).
 *
 * Renders nothing when the store is closed.
 */
import UpgradeModal from "@/components/feature-gate/UpgradeModal";
import { useUpgradeModalStore } from "@/stores/upgrade-modal.store";

const UpgradeModalHost = () => {
  const isOpen = useUpgradeModalStore((s) => s.isOpen);
  const reason = useUpgradeModalStore((s) => s.reason);
  const meta = useUpgradeModalStore((s) => s.meta);
  const close = useUpgradeModalStore((s) => s.close);

  return (
    <UpgradeModal
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) close();
      }}
      reason={reason}
      meta={meta}
    />
  );
};

export default UpgradeModalHost;
