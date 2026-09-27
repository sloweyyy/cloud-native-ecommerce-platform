using Ordering.Application.Mappers;
using Common.Mediator;
using Microsoft.Extensions.Logging;
using Ordering.Application.Commands;
using Ordering.Core.Entities;
using Ordering.Core.Repositories;

namespace Ordering.Application.Handlers;

public class CheckoutOrderCommandV2Handler : IRequestHandler<CheckoutOrderCommandV2, int>
{
    private readonly IOrderRepository _orderRepository;
    private readonly OrderMapper _mapper;
    private readonly ILogger<CheckoutOrderCommandHandler> _logger;

    public CheckoutOrderCommandV2Handler(IOrderRepository orderRepository, OrderMapper mapper,
        ILogger<CheckoutOrderCommandHandler> logger)
    {
        _orderRepository = orderRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<int> Handle(CheckoutOrderCommandV2 request, CancellationToken cancellationToken)
    {
        var orderEntity = _mapper.ToOrder(request);
        var generatedOrder = await _orderRepository.AddAsync(orderEntity);
        _logger.LogInformation($"Order with Id {generatedOrder.Id} successfully created with V2 Handler");
        return generatedOrder.Id;
    }
}