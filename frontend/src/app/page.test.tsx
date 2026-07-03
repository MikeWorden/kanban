import { describe, expect, it } from 'vitest';
import { createCard, deleteCard, moveCard, renameColumn, type BoardState } from '../lib/kanban';

const createBoard = (): BoardState => ({
  columns: [
    { id: 'todo', title: 'Backlog', cards: [{ id: 'card-1', title: 'Draft brief', details: 'Prepare the outline' }] },
    { id: 'doing', title: 'In Progress', cards: [] },
  ],
});

describe('kanban board state helpers', () => {
  it('renames a column', () => {
    const board = renameColumn(createBoard(), 'todo', 'Planned');

    expect(board.columns[0].title).toBe('Planned');
  });

  it('creates a card in the target column', () => {
    const board = createCard(createBoard(), 'doing', 'Design system', 'Define components');

    expect(board.columns[1].cards).toHaveLength(1);
    expect(board.columns[1].cards[0]).toEqual({
      id: expect.any(String),
      title: 'Design system',
      details: 'Define components',
    });
  });

  it('deletes a card from the board', () => {
    const board = deleteCard(createBoard(), 'card-1');

    expect(board.columns[0].cards).toHaveLength(0);
  });

  it('moves a card to another column', () => {
    const board = moveCard(createBoard(), 'card-1', 'todo', 'doing');

    expect(board.columns[0].cards).toHaveLength(0);
    expect(board.columns[1].cards).toHaveLength(1);
    expect(board.columns[1].cards[0].title).toBe('Draft brief');
  });
});
