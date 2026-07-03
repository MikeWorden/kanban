export type Card = {
  id: string;
  title: string;
  details: string;
};

export type Column = {
  id: string;
  title: string;
  cards: Card[];
};

export type BoardState = {
  columns: Column[];
};

export const initialBoard: BoardState = {
  columns: [
    {
      id: 'backlog',
      title: 'Backlog',
      cards: [
        {
          id: 'card-1',
          title: 'Draft launch plan',
          details: 'Outline the top priorities for the first release.',
        },
        {
          id: 'card-2',
          title: 'Review copy',
          details: 'Refine the onboarding screens before review.',
        },
      ],
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      cards: [
        {
          id: 'card-3',
          title: 'Polish dashboard',
          details: 'Tighten spacing, hierarchy, and motion.',
        },
      ],
    },
    {
      id: 'review',
      title: 'Review',
      cards: [],
    },
    {
      id: 'done',
      title: 'Done',
      cards: [],
    },
    {
      id: 'icebox',
      title: 'Icebox',
      cards: [],
    },
  ],
};

const createId = () => Math.random().toString(36).slice(2, 9);

export const renameColumn = (board: BoardState, columnId: string, title: string) => ({
  ...board,
  columns: board.columns.map((column) =>
    column.id === columnId ? { ...column, title } : column,
  ),
});

export const createCard = (board: BoardState, columnId: string, title: string, details: string) => ({
  ...board,
  columns: board.columns.map((column) =>
    column.id === columnId
      ? {
          ...column,
          cards: [...column.cards, { id: createId(), title, details }],
        }
      : column,
  ),
});

export const deleteCard = (board: BoardState, cardId: string) => ({
  ...board,
  columns: board.columns.map((column) => ({
    ...column,
    cards: column.cards.filter((card) => card.id !== cardId),
  })),
});

export const moveCard = (
  board: BoardState,
  cardId: string,
  sourceColumnId: string,
  targetColumnId: string,
) => {
  if (sourceColumnId === targetColumnId) {
    return board;
  }

  const sourceColumn = board.columns.find((column) => column.id === sourceColumnId);
  const targetColumn = board.columns.find((column) => column.id === targetColumnId);

  if (!sourceColumn || !targetColumn) {
    return board;
  }

  const card = sourceColumn.cards.find((item) => item.id === cardId);

  if (!card) {
    return board;
  }

  return {
    ...board,
    columns: board.columns.map((column) => {
      if (column.id === sourceColumnId) {
        return {
          ...column,
          cards: column.cards.filter((item) => item.id !== cardId),
        };
      }

      if (column.id === targetColumnId) {
        return {
          ...column,
          cards: [...column.cards, card],
        };
      }

      return column;
    }),
  };
};
