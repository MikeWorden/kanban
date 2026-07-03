"use client";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import {
  createCard,
  deleteCard,
  initialBoard,
  moveCard,
  renameColumn,
  type BoardState,
  type Card,
  type Column,
} from "@/lib/kanban";

type FormState = Record<string, { title: string; details: string; open: boolean }>;

const createEmptyForm = () => ({ title: "", details: "", open: false });

function CardItem({
  card,
  columnId,
  onDelete,
}: {
  card: Card;
  columnId: string;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: card.id,
      data: { type: "card", columnId, card },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-slate-800">{card.title}</h4>
          <p className="mt-1 text-sm text-slate-500">{card.details}</p>
        </div>
        <button
          type="button"
          className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100"
          onClick={onDelete}
          aria-label={`Delete ${card.title}`}
        >
          ×
        </button>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Drag card
        </span>
        <button
          type="button"
          className="cursor-grab rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600"
          {...attributes}
          {...listeners}
        >
          Move
        </button>
      </div>
    </div>
  );
}

function ColumnBoard({
  column,
  formState,
  onTitleChange,
  onToggleForm,
  onFormChange,
  onCreateCard,
  onDeleteCard,
}: {
  column: Column;
  formState: { title: string; details: string; open: boolean };
  onTitleChange: (columnId: string, value: string) => void;
  onToggleForm: (columnId: string) => void;
  onFormChange: (columnId: string, field: "title" | "details", value: string) => void;
  onCreateCard: (columnId: string) => void;
  onDeleteCard: (cardId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[18rem] flex-col rounded-[28px] border bg-slate-50/80 p-4 transition ${
        isOver ? "border-[#209dd7] shadow-[0_0_0_2px_rgba(32,157,215,0.2)]" : "border-slate-200"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          value={column.title}
          onChange={(event) => onTitleChange(column.id, event.target.value)}
          className="w-full bg-transparent text-lg font-semibold text-slate-800 outline-none"
          aria-label={`Rename ${column.title}`}
        />
        <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-500">
          {column.cards.length}
        </span>
      </div>

      <SortableContext
        items={column.cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-1 flex-col gap-3">
          {column.cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              columnId={column.id}
              onDelete={() => onDeleteCard(card.id)}
            />
          ))}
        </div>
      </SortableContext>

      {formState.open ? (
        <div className="mt-4 space-y-2 rounded-2xl border border-slate-200 bg-white p-3">
          <input
            value={formState.title}
            onChange={(event) => onFormChange(column.id, "title", event.target.value)}
            placeholder="Card title"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#209dd7]"
          />
          <textarea
            value={formState.details}
            onChange={(event) => onFormChange(column.id, "details", event.target.value)}
            placeholder="Short details"
            className="min-h-[72px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#209dd7]"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-500"
              onClick={() => onToggleForm(column.id)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-full bg-[#753991] px-3 py-1.5 text-sm font-semibold text-white"
              onClick={() => onCreateCard(column.id)}
            >
              Add card
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onToggleForm(column.id)}
          className="mt-4 rounded-full border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-[#209dd7] hover:text-[#209dd7]"
        >
          + Add card
        </button>
      )}
    </div>
  );
}

export function KanbanBoard() {
  const [board, setBoard] = useState<BoardState>(initialBoard);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [forms, setForms] = useState<FormState>({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const updateColumnTitle = (columnId: string, value: string) => {
    setBoard((current) => renameColumn(current, columnId, value));
  };

  const toggleForm = (columnId: string) => {
    setForms((current) => ({
      ...current,
      [columnId]: current[columnId]
        ? { ...current[columnId], open: !current[columnId].open }
        : { ...createEmptyForm(), open: true },
    }));
  };

  const updateFormValue = (
    columnId: string,
    field: "title" | "details",
    value: string,
  ) => {
    setForms((current) => ({
      ...current,
      [columnId]: {
        ...(current[columnId] ?? createEmptyForm()),
        [field]: value,
      },
    }));
  };

  const handleCreateCard = (columnId: string) => {
    const current = forms[columnId] ?? createEmptyForm();
    if (!current.title.trim()) {
      return;
    }

    setBoard((boardState) =>
      createCard(
        boardState,
        columnId,
        current.title.trim(),
        current.details.trim(),
      ),
    );

    setForms((currentForms) => ({
      ...currentForms,
      [columnId]: { title: "", details: "", open: false },
    }));
  };

  const handleDeleteCard = (cardId: string) => {
    setBoard((current) => deleteCard(current, cardId));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const card = event.active.data.current?.card as Card | undefined;
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) {
      return;
    }

    const sourceColumnId = active.data.current?.columnId as string | undefined;
    const targetColumnId = over.id as string;

    if (!sourceColumnId || !targetColumnId || sourceColumnId === targetColumnId) {
      return;
    }

    setBoard((current) => moveCard(current, active.id as string, sourceColumnId, targetColumnId));
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#fff9de,_#ffffff_45%,_#f5f8ff)] px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[32px] border border-slate-200 bg-white/80 p-6 shadow-[0_20px_80px_rgba(3,33,71,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#209dd7]">
                Studio board
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-[#032147] sm:text-4xl">
                Plan, move, and ship with clarity.
              </h1>
              <p className="mt-3 max-w-2xl text-base text-slate-600">
                A calm, focused kanban workspace for turning great ideas into confident execution.
              </p>
            </div>
            <div className="rounded-2xl border border-[#ecad0a]/40 bg-[#fff7da] px-4 py-3 text-sm font-medium text-[#925d00]">
              {board.columns.reduce((count, column) => count + column.cards.length, 0)} cards in motion
            </div>
          </div>
        </header>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid gap-4 xl:grid-cols-5">
            {board.columns.map((column) => (
              <ColumnBoard
                key={column.id}
                column={column}
                formState={forms[column.id] ?? createEmptyForm()}
                onTitleChange={updateColumnTitle}
                onToggleForm={toggleForm}
                onFormChange={updateFormValue}
                onCreateCard={handleCreateCard}
                onDeleteCard={handleDeleteCard}
              />
            ))}
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                <h4 className="font-semibold text-slate-800">{activeCard.title}</h4>
                <p className="mt-1 text-sm text-slate-500">{activeCard.details}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
