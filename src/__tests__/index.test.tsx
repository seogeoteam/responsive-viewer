import React from 'react'
import ReactDOM from 'react-dom'

jest.mock('react-dom', () => {
    const render = jest.fn()
    return {
        __esModule: true,
        default: {
            render,
        },
        render,
    }
})

jest.mock('../containers/App', () => () => <div data-testid="mock-app" />)
jest.mock('../store', () => ({
    __esModule: true,
    default: {
        getState: jest.fn(() => ({})),
        subscribe: jest.fn(),
        dispatch: jest.fn(),
    },
}))

describe('index.tsx entry point', () => {
    let rootElement: HTMLDivElement

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetModules()

        // Ensure scrollRestoration property exists on window.history in the test environment
        Object.defineProperty(window.history, 'scrollRestoration', {
            value: 'auto',
            writable: true,
            configurable: true,
        })

        // Create the mounting root expected by index.tsx
        rootElement = document.createElement('div')
        rootElement.id = 'RESPONSIVE-VIEWER-ROOT'
        document.body.appendChild(rootElement)
    })

    afterEach(() => {
        if (rootElement && rootElement.parentNode) {
            rootElement.parentNode.removeChild(rootElement)
        }
    })

    it('sets window.history.scrollRestoration to manual', () => {
        require('../index')

        expect(window.history.scrollRestoration).toBe('manual')
    })

    it('does not throw when scrollRestoration is not in window.history', () => {
        // @ts-ignore
        delete window.history.scrollRestoration

        expect(() => require('../index')).not.toThrow()
    })

    it('renders the application into #RESPONSIVE-VIEWER-ROOT', () => {
        require('../index')
        const ReactDOMMock = require('react-dom')

        expect(ReactDOMMock.render).toHaveBeenCalledTimes(1)
        expect(ReactDOMMock.render).toHaveBeenCalledWith(
            expect.anything(),
            rootElement
        )
    })

    it('does not render if #RESPONSIVE-VIEWER-ROOT is missing', () => {
        rootElement.remove()
        const ReactDOMMock = require('react-dom')

        expect(() => require('../index')).not.toThrow()
        expect(ReactDOMMock.render).not.toHaveBeenCalled()
    })
})