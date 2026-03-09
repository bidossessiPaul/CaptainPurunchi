"use client";

interface Item {
  id: string;
  name: string;
  description: string;
  price: string;
  active: boolean;
}

interface ItemRowProps {
  item: Item;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isEditing: boolean;
  editName: string;
  editDesc: string;
  editPrice: string;
  onEditNameChange: (v: string) => void;
  onEditDescChange: (v: string) => void;
  onEditPriceChange: (v: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onToggleActive: (active: boolean) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function ItemRow({
  item,
  index,
  isFirst,
  isLast,
  isEditing,
  editName,
  editDesc,
  editPrice,
  onEditNameChange,
  onEditDescChange,
  onEditPriceChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleActive,
  onDelete,
  onMoveUp,
  onMoveDown,
}: ItemRowProps) {
  if (isEditing) {
    return (
      <tr>
        <td className="text-muted">{index + 1}</td>
        <td>
          <input
            type="text"
            className="form-control form-control-sm"
            value={editName}
            onChange={(e) => onEditNameChange(e.target.value)}
          />
        </td>
        <td>
          <input
            type="text"
            className="form-control form-control-sm"
            value={editDesc}
            onChange={(e) => onEditDescChange(e.target.value)}
          />
        </td>
        <td>
          <input
            type="text"
            className="form-control form-control-sm"
            value={editPrice}
            onChange={(e) => onEditPriceChange(e.target.value)}
          />
        </td>
        <td>
          <div className="d-flex gap-1">
            <button className="btn btn-sm btn-primary" onClick={onSaveEdit} title="Sauvegarder">
              <i className="iconoir-check"></i>
            </button>
            <button className="btn btn-sm btn-light" onClick={onCancelEdit} title="Annuler">
              <i className="iconoir-xmark"></i>
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr style={{ opacity: item.active ? 1 : 0.5 }}>
      <td className="text-muted">{index + 1}</td>
      <td className="fw-medium">{item.name}</td>
      <td className="text-muted fs-13">{item.description}</td>
      <td className="fw-semibold text-primary">{item.price}</td>
      <td>
        <div className="d-flex gap-1">
          <button className="btn btn-sm btn-light" onClick={onStartEdit} title="Modifier">
            <i className="iconoir-edit-pencil"></i>
          </button>
          <button className="btn btn-sm btn-light" disabled={isFirst} onClick={onMoveUp} title="Monter">
            <i className="iconoir-arrow-up"></i>
          </button>
          <button className="btn btn-sm btn-light" disabled={isLast} onClick={onMoveDown} title="Descendre">
            <i className="iconoir-arrow-down"></i>
          </button>
          <button
            className="btn btn-sm btn-light"
            onClick={() => onToggleActive(!item.active)}
            title={item.active ? "Désactiver" : "Activer"}
          >
            <i className={`iconoir-${item.active ? "eye" : "eye-off"}`}></i>
          </button>
          <button className="btn btn-sm btn-outline-danger" onClick={onDelete} title="Supprimer">
            <i className="iconoir-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  );
}
