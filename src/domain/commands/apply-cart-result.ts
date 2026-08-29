import { updateDomainState } from "@/src/domain/scene-store";

export function applyCartResult(options: {
  acceptedMerchandiseIds: string[];
  rejectedMerchandiseIds: string[];
}) {
  const accepted = new Set(options.acceptedMerchandiseIds);
  const rejected = new Set(options.rejectedMerchandiseIds);
  updateDomainState((state) => ({
    ...state,
    itemsById: Object.fromEntries(
      Object.entries(state.itemsById).map(([id, item]) => [
        id,
        {
          ...item,
          status: accepted.has(item.variant.merchandiseId)
            ? ("carted" as const)
            : rejected.has(item.variant.merchandiseId)
              ? ("error" as const)
              : item.status,
        },
      ]),
    ),
  }));
}
